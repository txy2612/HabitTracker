import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { app } from "../../app.js";
import { pool } from "../../db/pool.js";

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
       password_hash TEXT NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`,
  ).then(() => undefined);

  await schemaReady;
}
