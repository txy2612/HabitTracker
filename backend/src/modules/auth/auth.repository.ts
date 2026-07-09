import { pool } from "../../db/pool.js";

// we keep taling bout User (each user = one row -> UserRow)
// TypeScript give it its types
export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

// async bcz program shouldnt freeze when db is doing transaction
// async: I'll continue doing other things. Tell me when you're done.
export async function findUserByEmail(email: string):
Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT
       id::text AS id,
       name,
       email,
       password_hash,
       created_at::text AS created_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

// create user in db
// 1 object -> cleaner when many fields
// input must have these properties
export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;// repo nvr receive raw pw
}): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING
       id::text AS id,
       name,
       email,
       password_hash,
       created_at::text AS created_at`,
    [input.name, input.email, input.passwordHash],
  );

  return result.rows[0];
}
