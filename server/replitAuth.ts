import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { createModuleLogger, logAuthEvent, logError } from "./logger";

// Create module logger for authentication
const authLogger = createModuleLogger('auth');

if (!process.env.REPLIT_DOMAINS) {
  authLogger.fatal("Environment variable REPLIT_DOMAINS not provided");
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
  user.sub = user.claims?.sub; // Add sub directly to user object for easy access
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    fullName: `${claims["first_name"] || ''} ${claims["last_name"] || ''}`.trim(),
    profilePicture: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  // Setup Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Create user object similar to Replit auth
        const user = {
          sub: profile.id,
          claims: {
            sub: profile.id,
            email: profile.emails?.[0]?.value,
            first_name: profile.name?.givenName,
            last_name: profile.name?.familyName,
            profile_image_url: profile.photos?.[0]?.value,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        };

        // Upsert user to database
        await storage.upsertUser({
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          fullName: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
          profilePicture: profile.photos?.[0]?.value || '',
        });

        return done(null, user);
      } catch (error) {
        logError(authLogger, error, {
          category: 'authentication',
          method: 'google_oauth',
          operation: 'user_creation'
        });
        return done(error, false);
      }
    }));
  } else {
    authLogger.warn("Google OAuth not configured", {
      category: 'configuration',
      service: 'google_oauth',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Secrets'
    });
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser(async (user: Express.User, cb) => {
    try {
      // Ensure user object has the necessary fields
      const userObj = user as any;
      if (userObj.claims && userObj.claims.sub && !userObj.sub) {
        userObj.sub = userObj.claims.sub;
      }
      cb(null, userObj);
    } catch (error) {
      logError(authLogger, error, {
        category: 'session',
        operation: 'deserialize_user'
      });
      cb(error, null);
    }
  });

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err: Error | null, user: Express.User | false) => {
      if (err) {
        logError(authLogger, err, {
          category: 'authentication',
          method: 'replit_oauth',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        logAuthEvent(authLogger, 'replit_auth_error', undefined, {
          method: 'replit_oauth',
          error: err.message
        });
        return res.redirect("/api/login");
      }
      if (!user) {
        logAuthEvent(authLogger, 'replit_auth_failed', undefined, {
          method: 'replit_oauth',
          reason: 'no_user_returned'
        });
        return res.redirect("/api/login");
      }
      
      // Regenerate session ID to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          logError(authLogger, err, {
            category: 'session',
            operation: 'regenerate',
            userId: user.claims?.sub
          });
          return res.redirect("/api/login");
        }
        
        // Log in the user after session regeneration
        req.logIn(user, (err) => {
          if (err) {
            logError(authLogger, err, {
              category: 'session',
              operation: 'login',
              userId: user.claims?.sub
            });
            return res.redirect("/api/login");
          }
          
          // Log successful authentication
          logAuthEvent(authLogger, 'replit_auth_success', user.claims?.sub, {
            method: 'replit_oauth',
            email: user.claims?.email,
            sessionId: req.sessionID,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          return res.redirect("/onboarding");
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const user = req.user as any;
    const userId: string | undefined = user?.sub || user?.claims?.sub;
    
    req.logout((err) => {
      if (err) {
        logError(authLogger, err, {
          category: 'session',
          operation: 'logout',
          userId
        });
      }
      
      // Destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          logError(authLogger, err, {
            category: 'session',
            operation: 'destroy_session',
            userId
          });
        }
        
        // Log successful logout
        logAuthEvent(authLogger, 'user_logout', userId, {
          sessionId: req.sessionID,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        
        // For development, just redirect to landing page
        if (process.env.NODE_ENV === 'development') {
          res.redirect('/landing');
        } else {
          // In production, use the OAuth end session URL
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}/landing`,
            }).href
          );
        }
      });
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err: Error | null, user: Express.User | false) => {
      if (err) {
        logError(authLogger, err, {
          category: 'authentication',
          method: 'google_oauth',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        logAuthEvent(authLogger, 'google_auth_error', undefined, {
          method: 'google_oauth',
          error: err.message
        });
        return res.redirect("/api/login");
      }
      if (!user) {
        logAuthEvent(authLogger, 'google_auth_failed', undefined, {
          method: 'google_oauth',
          reason: 'no_user_returned'
        });
        return res.redirect("/api/login");
      }
      
      // Regenerate session ID to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          logError(authLogger, err, {
            category: 'session',
            operation: 'regenerate',
            userId: user.claims?.sub
          });
          return res.redirect("/api/login");
        }
        
        // Log in the user after session regeneration
        req.logIn(user, (err) => {
          if (err) {
            logError(authLogger, err, {
              category: 'session',
              operation: 'login',
              userId: user.claims?.sub
            });
            return res.redirect("/api/login");
          }
          
          // Log successful authentication
          logAuthEvent(authLogger, 'google_auth_success', user.claims?.sub, {
            method: 'google_oauth',
            email: user.claims?.email,
            sessionId: req.sessionID,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          return res.redirect("/onboarding");
        });
      });
    })(req, res, next);
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    logError(authLogger, error, {
      category: 'authentication',
      operation: 'token_refresh',
      userId: user?.sub
    });
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
