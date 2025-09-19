import express, { type Request, Response, NextFunction } from "express";
import { sql } from "drizzle-orm";
import { setupAuth } from "./replitAuth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./background-scheduler.js"; // Auto-start background scheduler

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const { db } = await import("./db");

  // Test database connection
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected successfully");

    // Run database migrations first
    console.log("🔄 Running database migrations...");
    try {
      const { runMigrations } = await import("./runMigrations");
      await runMigrations();
      console.log("✅ Database migrations completed");
    } catch (migrationError) {
      console.error("❌ Database migration failed:", migrationError);
      // Continue but log the error
    }

    // Seed frameworks first
    const { seedFrameworks } = await import('./seedData');
    await seedFrameworks();

    // Seed compliance data
    try {
      const { seedComplianceData } = await import("./seedComplianceData");
      await seedComplianceData();
      console.log("✅ Comprehensive compliance data seeding completed");
    } catch (seedError) {
      console.warn("⚠️ Database seeding warning:", seedError);
      // Don't exit on seeding failure - continue with server startup
    }

    // Seed policy templates
    try {
      const { seedPolicyTemplates } = await import('./seedPolicyTemplates');
      await seedPolicyTemplates();
      console.log("✅ Policy templates seeding completed");
    } catch (templateError) {
      console.warn("⚠️ Policy template seeding warning:", templateError);
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();