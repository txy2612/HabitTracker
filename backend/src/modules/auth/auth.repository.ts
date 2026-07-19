import { pool } from "../../db/pool.js";

// we keep taling bout User (each user = one row -> UserRow)
// TypeScript give it its types
export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
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
       google_sub,
       created_at::text AS created_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

// Purpose: returns the matching user if they have used Google before
export async function findUserByGoogleSub(
  googleSub: string,
): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT
       id::text AS id,
       name,
       email,
       password_hash,
       google_sub,
       created_at::text AS created_at
     FROM users
     WHERE google_sub = $1`,
    [googleSub],
  );

  return result.rows[0] ?? null;
}

export async function createGoogleUser(input: {
  name: string;
  email: string;
  googleSub: string;
}): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (
       name,
       email,
       password_hash,
       google_sub
     )
     VALUES ($1, $2, NULL, $3)
     ON CONFLICT (google_sub)
       WHERE google_sub IS NOT NULL
     DO UPDATE SET
       google_sub = EXCLUDED.google_sub
     RETURNING
       id::text AS id,
       name,
       email,
       password_hash,
       google_sub,
       created_at::text AS created_at`,
    [input.name, input.email, input.googleSub],
  );

  return result.rows[0];
}

// links HabitTracker w a Google identity
// by linking an userId with a googleSub (google token)
// without this: a google sub finds no userId
export async function linkGoogleUser(input: {
  userId: string;
  googleSub: string;
}): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `UPDATE users
     SET google_sub = $2
     WHERE id = $1
     RETURNING
       id::text AS id,
       name,
       email,
       password_hash,
       google_sub,
       created_at::text AS created_at`,
    [input.userId, input.googleSub],
  );

  return result.rows[0];
}

// create user in db
// 1 object -> cleaner when many fields
// input must have these properties
/* Export an async funtion named createUser.
   Accepts object called input, with name,email 
   Inserts thats user into database
   Return the created database user row

 */
export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;// repo nvr receive raw pw
}): Promise<UserRow> { //Promise<return UserRow> later
  const result = await pool.query<UserRow>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING
       id::text AS id,
       name,
       email,
       password_hash,
       google_sub,
       created_at::text AS created_at`,
    [input.name, input.email, input.passwordHash],
  );//add google_sub because my IserRow defined this shape to include it

  return result.rows[0];
}
