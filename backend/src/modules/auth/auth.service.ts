import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../../shared/httpErrors.js";
import { createUser, findUserByEmail, type UserRow } from "./auth.repository.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

export type RegisterInput = { name: string; email: string; password: string };
export type LoginInput = { email: string; password: string };

function toAuthResult(user: UserRow) {
  return {
    token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function registerUser(input: RegisterInput) {
  if (await findUserByEmail(input.email)) {
    throw new HttpError(409, "Email already registered");
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, 10),
  });
  return toAuthResult(user);
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  const passwordMatches = user ? await bcrypt.compare(input.password, user.password_hash) : false;

  if (!user || !passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }
  return toAuthResult(user);
}
