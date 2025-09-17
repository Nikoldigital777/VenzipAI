
import { db } from "./db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  name: string;
  content: string;
  order: number;
}

export async function runMigrations() {
  console.log("🔄 Starting database migrations...");

  // Create migrations table to track executed migrations
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Define migrations in correct execution order
  const migrations: Migration[] = [
    {
      name: "fix-user-columns.sql",
      content: fs.readFileSync(path.join(__dirname, "migrations", "fix-user-columns.sql"), "utf8"),
      order: 1
    },
    {
      name: "add-onboarding-tables.sql", 
      content: fs.readFileSync(path.join(__dirname, "migrations", "add-onboarding-tables.sql"), "utf8"),
      order: 2
    },
    {
      name: "fix-schema-issues.sql",
      content: fs.readFileSync(path.join(__dirname, "migrations", "fix-schema-issues.sql"), "utf8"),
      order: 3
    }
  ];

  // Sort by order to ensure correct execution sequence
  migrations.sort((a, b) => a.order - b.order);

  for (const migration of migrations) {
    try {
      // Check if migration already executed
      const result = await db.execute(sql`
        SELECT 1 FROM schema_migrations WHERE migration_name = ${migration.name}
      `);

      if (result.length > 0) {
        console.log(`✅ Migration ${migration.name} already executed, skipping`);
        continue;
      }

      console.log(`🔄 Running migration: ${migration.name}`);
      
      // Execute the migration
      await db.execute(sql.raw(migration.content));
      
      // Record successful execution with conflict handling
      await db.execute(sql`
        INSERT INTO schema_migrations (migration_name) VALUES (${migration.name})
        ON CONFLICT (migration_name) DO NOTHING
      `);
      
      console.log(`✅ Migration ${migration.name} completed successfully`);
    } catch (error) {
      console.error(`❌ Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  console.log("🎉 All migrations completed successfully");
}
