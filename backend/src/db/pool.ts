import pg from "pg"; // pg = postgreSQL tranlator; Node -> pg library -> PostgreSQL
import { env } from "../config/env.js";

const { Pool, types } = pg;
// pool = database pool
// types = customize how PostgreSQL data types -> convert to JS

types.setTypeParser(1082, (value: string) => value);

export const pool = new Pool({
  connectionString: env.databaseUrl,
});
