import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../../database/schema.sql");

async function main() {
  const schemaSql = await readFile(schemaPath, "utf8");

  await pool.query(schemaSql);

  console.log(`Applied schema from ${schemaPath}`);
}

try {
  await main();
} catch (error) {
  console.error("Failed to apply database schema.", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
