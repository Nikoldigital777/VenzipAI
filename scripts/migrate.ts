
#!/usr/bin/env tsx

import { runMigrations } from "../server/runMigrations";

async function main() {
  try {
    await runMigrations();
    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
