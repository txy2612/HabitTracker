import jwt from "jsonwebtoken"; // used to create login tokens
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { createUser, findUserByEmail } from "./auth.repository.js";// connects service to db 

// if .env contains JWT_SECRET -> use it
// ?? : if left = null OR undefined -> used right
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

// Purpose: generate JWT token
function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    // sign = create a token
    expiresIn: "7d",
  });
}

export async function registerUser(input: RegisterInput) {
// Ask repo: "Can you find someone with this email?"
// Possible res = UserRow OR null
  const existingUser = await findUserByEmail(input.email);

  // don't allow duplicate emails
  if (existingUser) {
    // create error object
    const error = new Error("Email already registered");
    // attach code to the error: error.statusCode = 409 (JS format)
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;// stop evth -> jump to controller 'catch(error)' -> controller: next(error) -> msg: "Email alr registered"
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash: input.password,
  });

  // return response to Controller 
  return {
    token: signToken(user.id),// frontend needs JWT after registration
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user || user.password_hash !== input.password) {
    const error = new Error("Invalid email or password");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  return {
    token: signToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
