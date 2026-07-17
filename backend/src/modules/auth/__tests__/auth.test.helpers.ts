import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { app } from "../../../app.js";
import { pool } from "../../../db/pool.js";

let schemaReady: Promise<void> | null = null;

export async function withTestServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  await ensureSchema();

  const server = app.listen(0, "127.0.0.1");

  await once(server, "listening");

  try {
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    return await run(baseUrl);
  } finally {
    await closeServer(server);
  }
}

export function createTestEmail(prefix: string): string {
  return `${prefix}.${randomUUID()}@example.com`;
}

export async function deleteUserByEmail(email: string): Promise<void> {
  await pool.query(
    `DELETE FROM users
     WHERE email = $1`,
    [email],
  );
}

export async function findTestUserByEmail(email: string): Promise<{
  name: string;
  email: string;
  passwordHash: string | null;// allow null if user uses Google to sign-in
} | null> {
  const result = await pool.query<{
    name: string;
    email: string;
    password_hash: string | null;
  }>(
    `SELECT name, email, password_hash
     FROM users
     WHERE email = $1`,
    [email],
  );

  const user = result.rows[0];
  return user
    ? { name: user.name, email: user.email, passwordHash: user.password_hash }
    : null;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function ensureSchema(): Promise<void> {
  schemaReady ??= pool.query(
    `CREATE TABLE IF NOT EXISTS users (
       id BIGSERIAL PRIMARY KEY,
       name TEXT NOT NULL,
       email TEXT NOT NULL UNIQUE,
       password_hash TEXT,
       google_sub TEXT,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     );

     ALTER TABLE users
       ALTER COLUMN password_hash DROP NOT NULL,
       ADD COLUMN IF NOT EXISTS google_sub TEXT;

     CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub
       ON users (google_sub)
       WHERE google_sub IS NOT NULL;`,
  ).then(() => undefined);

  await schemaReady;
}