import pg from "pg";
import { env } from "../config/env.js";

const { Pool, types } = pg;

types.setTypeParser(1082, (value: string) => value);

export const pool = new Pool({
  connectionString: env.databaseUrl,
});
