import express, { type Request, Response, NextFunction } from "express";
import { sql } from "drizzle-orm";
import { setupAuth } from "./replitAuth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./background-scheduler.js"; // Auto-start background scheduler
import { createModuleLogger, withTiming, logError, logDatabaseOperation } from "./logger";
import { requestLoggerMiddleware, errorLoggerMiddleware, performanceLoggerMiddleware } from "./middleware/requestLogger";
import { evidenceBackgroundService } from './services/evidenceBackgroundService';

// Create module logger for server initialization
const serverLogger = createModuleLogger('server');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add structured request logging middleware
app.use(requestLoggerMiddleware);
app.use(performanceLoggerMiddleware(2000)); // Log slow requests over 2 seconds

(async () => {
  serverLogger.info("Starting Venzip API server...");

  const { db } = await import("./db");

  // Test database connection
  try {
    await withTiming(serverLogger, 'database_connection', async () => {
      await db.execute(sql`SELECT 1`);
    });
    serverLogger.info("Database connected successfully");

    // Run database migrations first
    serverLogger.info("Starting database migrations...");
    try {
      await withTiming(serverLogger, 'database_migrations', async () => {
        const { runMigrations } = await import("./runMigrations");
        await runMigrations();
      });
      serverLogger.info("Database migrations completed successfully");
      logDatabaseOperation(serverLogger, 'migrations_completed');
    } catch (migrationError) {
      logError(serverLogger, migrationError, { 
        category: 'database',
        operation: 'migrations' 
      });
      // Continue but log the error
    }

    // Seed frameworks first
    try {
      await withTiming(serverLogger, 'framework_seeding', async () => {
        const { seedFrameworks } = await import('./seedData');
        await seedFrameworks();
      });
    } catch (seedError) {
      logError(serverLogger, seedError, { 
        category: 'database',
        operation: 'framework_seeding' 
      });
    }

    // Seed compliance data
    try {
      await withTiming(serverLogger, 'compliance_data_seeding', async () => {
        const { seedComplianceData } = await import("./seedComplianceData");
        await seedComplianceData();
      });
      serverLogger.info("Comprehensive compliance data seeding completed");
      logDatabaseOperation(serverLogger, 'compliance_data_seeded');
    } catch (seedError) {
      serverLogger.warn("Database seeding warning", { 
        category: 'database',
        operation: 'compliance_data_seeding',
        error: seedError 
      });
      // Don't exit on seeding failure - continue with server startup
    }

    // Seed policy templates
    try {
      await withTiming(serverLogger, 'policy_template_seeding', async () => {
        const { seedPolicyTemplates } = await import('./seedPolicyTemplates');
        await seedPolicyTemplates();
      });
      serverLogger.info("Policy templates seeding completed");
      logDatabaseOperation(serverLogger, 'policy_templates_seeded');
    } catch (templateError) {
      serverLogger.warn("Policy template seeding warning", { 
        category: 'database',
        operation: 'policy_template_seeding',
        error: templateError 
      });
    }
  } catch (error) {
    logError(serverLogger, error, { 
      category: 'database',
      operation: 'connection',
      fatal: true 
    });
    serverLogger.fatal("Database connection failed - exiting");
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Add structured error logging middleware
  app.use(errorLoggerMiddleware);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error with context if not already logged by middleware
    if (!req.logger) {
      logError(serverLogger, err, {
        category: 'application_error',
        method: req.method,
        path: req.path,
        statusCode: status,
      });
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    serverLogger.info("Setting up Vite development server");
    await setupVite(app, server);
  } else {
    serverLogger.info("Setting up static file serving for production");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  server.listen(port, "0.0.0.0", () => {
    serverLogger.info({ 
      port, 
      environment: process.env.NODE_ENV || 'development',
      category: 'server_startup' 
    }, `Venzip API server listening on port ${port}`);

    // Start evidence background service
    evidenceBackgroundService.start();
  });
})();