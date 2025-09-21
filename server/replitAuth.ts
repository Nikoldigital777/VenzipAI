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

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Check for required environment variables
const hasReplitAuth = !!(process.env.REPLIT_DOMAINS && process.env.REPL_ID);
const hasGoogleAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (!hasReplitAuth && !hasGoogleAuth && !isDevelopment) {
  authLogger.fatal("No authentication method configured - please set up Replit Auth or Google OAuth");
  throw new Error("No authentication method configured");
}

if (!hasReplitAuth) {
  authLogger.warn("Replit authentication not configured", {
    category: 'configuration',
    service: 'replit_auth',
    message: 'REPLIT_DOMAINS and REPL_ID required for Replit authentication'
  });
}

const getOidcConfig = memoize(
  async () => {
    if (!process.env.REPL_ID) {
      throw new Error("REPL_ID required for OIDC configuration");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

// Development user for testing
const createDevelopmentUser = async () => {
  const devUser = {
    sub: 'dev-user-1',
    claims: {
      sub: 'dev-user-1',
      email: 'dev@venzip.local',
      first_name: 'Dev',
      last_name: 'User',
      profile_image_url: '',
    },
    access_token: 'dev-token',
    refresh_token: 'dev-refresh',
    expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
  };

  // Upsert development user to database
  await storage.upsertUser({
    id: 'dev-user-1',
    email: 'dev@venzip.local',
    fullName: 'Dev User',
    profilePicture: '',
  });

  return devUser;
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store in development if no DATABASE_URL
  let sessionStore;
  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    authLogger.warn("Using memory store for sessions - sessions will not persist across restarts", {
      category: 'configuration',
      service: 'session_store'
    });
  }

  // Use default secret in development if not provided
  const sessionSecret = process.env.SESSION_SECRET || (isDevelopment ? 'dev-secret-change-in-production' : undefined);
  
  if (!sessionSecret) {
    authLogger.fatal("SESSION_SECRET environment variable required");
    throw new Error("SESSION_SECRET environment variable required");
  }

  return session({
    secret: sessionSecret,
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

  // Setup Replit authentication if configured
  if (hasReplitAuth) {
    try {
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

      for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
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
    } catch (error) {
      authLogger.error("Failed to setup Replit authentication", {
        category: 'configuration',
        service: 'replit_auth',
        error: error
      });
    }
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
    // In development without proper auth, auto-login as dev user
    if (isDevelopment && !hasReplitAuth && !hasGoogleAuth) {
      createDevelopmentUser().then(user => {
        req.logIn(user, (err) => {
          if (err) {
            authLogger.error("Development login failed", {
              category: 'authentication',
              method: 'development',
              error: err
            });
            return res.redirect("/landing?error=dev-login-failed");
          }
          
          logAuthEvent(authLogger, 'dev_auth_success', user.claims?.sub, {
            method: 'development',
            email: user.claims?.email,
            sessionId: req.sessionID,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          return res.redirect("/onboarding");
        });
      }).catch(err => {
        authLogger.error("Development user creation failed", {
          category: 'authentication',
          method: 'development',
          error: err
        });
        return res.redirect("/landing?error=dev-setup-failed");
      });
      return;
    }

    // Try Replit auth if available
    if (hasReplitAuth) {
      return passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    }
    
    // Try Google auth if available
    if (hasGoogleAuth) {
      return res.redirect('/api/auth/google');
    }

    // No auth method available
    authLogger.warn("Login attempted but no authentication method available", {
      category: 'authentication',
      method: 'none',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    return res.redirect("/landing?error=no-auth-method");
  });

  app.get("/api/callback", (req, res, next) => {
    // Only handle Replit callback if Replit auth is configured
    if (!hasReplitAuth) {
      authLogger.warn("Callback attempted but Replit auth not configured", {
        category: 'authentication',
        method: 'replit_oauth',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.redirect("/api/login");
    }

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
        
        // For development or when Replit auth is not configured, just redirect to landing page
        if (isDevelopment || !hasReplitAuth) {
          res.redirect('/landing');
        } else {
          getOidcConfig().then(config => {
            res.redirect(
              client.buildEndSessionUrl(config, {
                client_id: process.env.REPL_ID!,
                post_logout_redirect_uri: `${req.protocol}://${req.hostname}/landing`,
              }).href
            );
          }).catch(error => {
            authLogger.error("Failed to get OIDC config for logout", {
              category: 'authentication',
              operation: 'logout',
              error: error
            });
            res.redirect('/landing');
          });
        }
      });
    });
  });

  // Google OAuth routes (only if configured)
  if (hasGoogleAuth) {
    app.get("/api/auth/google", 
      passport.authenticate("google", { scope: ["profile", "email"] })
    );
  } else {
    app.get("/api/auth/google", (req, res) => {
      authLogger.warn("Google auth attempted but not configured", {
        category: 'authentication',
        method: 'google_oauth',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.redirect("/api/login");
    });
  }

  app.get("/api/auth/google/callback", (req, res, next) => {
    // Only handle Google callback if Google auth is configured
    if (!hasGoogleAuth) {
      authLogger.warn("Google callback attempted but Google auth not configured", {
        category: 'authentication',
        method: 'google_oauth',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.redirect("/api/login");
    }

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

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // In development mode or for development users, skip token validation
  if (isDevelopment && user?.sub === 'dev-user-1') {
    return next();
  }

  if (!user?.expires_at) {
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

  // Only try to refresh if we have Replit auth configured
  if (!hasReplitAuth) {
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
