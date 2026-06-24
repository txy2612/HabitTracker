import { pool } from "../config/db/pool.js";
import { checkDatabaseHealth } from "../config/db/health.js";

async function main() {
  const health = await checkDatabaseHealth();

  console.log(health.message);

  if (health.missingTables.length > 0) {
    console.log(`Missing tables: ${health.missingTables.join(", ")}`);
  }

  if (!health.ok) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error("Database health check failed.", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
