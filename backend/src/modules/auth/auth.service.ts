import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../../shared/httpErrors.js";
import { createUser, findUserByEmail, type UserRow } from "./auth.repository.js";

/*frontend authService runs in browser
  backend authService runs in Node/Express server

  frontend authService = client-side session workflow
  backend authService = server-side auth rules/security
 */

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

export type RegisterInput = { name: string; email: string; password: string };
export type LoginInput = { email: string; password: string };

function toAuthResult(user: UserRow) {
  return {
    // create a JWT token
    token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function registerUser(input: RegisterInput) {
  //1. check if email already exists
  if (await findUserByEmail(input.email)) {
    throw new HttpError(409, "Email already registered");
  }

  //3. create user in DB
  const user = await createUser({
    name: input.name,
    email: input.email,
    //2. Hash the password
    // Important: raw pw is not stored
    passwordHash: await bcrypt.hash(input.password, 10),
  });
  //4. After created, backend return the auth result (with token)
  return toAuthResult(user);
}

export async function loginUser(input: LoginInput) {
  // find user from DB
  const user = await findUserByEmail(input.email);
  // compare password with hashed password from db
  const passwordMatches = user ? await bcrypt.compare(input.password, user.password_hash) : false;

  if (!user || !passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }
  return toAuthResult(user);
}
