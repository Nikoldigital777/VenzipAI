
import { db } from './db';
import { sql } from 'drizzle-orm';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function runMigrations() {
  console.log("🔄 Starting database migrations...");
  
  try {
    // Get all SQL migration files from the migrations directory
    const migrationsPath = './server/migrations';
    const files = await readdir(migrationsPath);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct execution order

    console.log(`Found ${sqlFiles.length} migration files to execute`);

    // Execute each migration file
    for (const file of sqlFiles) {
      console.log(`Executing migration: ${file}`);
      const filePath = join(migrationsPath, file);
      const migrationSQL = await readFile(filePath, 'utf-8');
      
      if (migrationSQL.trim()) {
        await db.execute(sql.raw(migrationSQL));
        console.log(`✅ Completed migration: ${file}`);
      }
    }
    
    console.log("✅ All database migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
