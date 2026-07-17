import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../../shared/httpErrors.js";
import { createUser, createGoogleUser, findUserByEmail, findUserByGoogleSub, type UserRow } from "./auth.repository.js";
import { verifyGoogleCredential } from "./googleIdentity.js";

/*frontend authService runs in browser
  backend authService runs in Node/Express server

  frontend authService = client-side session workflow
  backend authService = server-side auth rules/security
 */

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

export type RegisterInput = { name: string; email: string; password: string };
export type LoginInput = { email: string; password: string };
export type GoogleLoginInput = {
  credential: string;// credential = Google token = "eyJhbGciOiJSUzI1NiIs..."
}

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
  // IF user exist && HAS password_hash -> compare
  // Otherwise -> bycrypt.compare(password, null) -> error
  const passwordMatches = user?.password_hash ? await bcrypt.compare(input.password, user.password_hash) : false;

  if (!user || !passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }
  return toAuthResult(user);
}

export async function loginWithGoogle(
  input: GoogleLoginInput,
  verifyCredential = verifyGoogleCredential,
){
  //1. Verify the credential and extract trusted Google details
  const identity = await verifyCredential(input.credential);

  //2. Check whether this Google account has signed in before
  const existingGoogleUser = await findUserByGoogleSub(identity.sub);

  if(existingGoogleUser){
    return toAuthResult(existingGoogleUser);
  }

  //3. Do not automatically connect it to an existing password account
  const existingEmailUser = await findUserByEmail(identity.email);

  if(existingEmailUser){
    throw new HttpError(
      409,
      "An account with this email already exists. Sign in using your password.",
    );
  }

  // 4. It is a new Google user on Habit Tracker, so create the Habit Tracker account 
  const newGoogleUser = await createGoogleUser({
    name: identity.name,
    email: identity.email,
    googleSub: identity.sub,
  });

  // 5. Return HabitTracker's normal JWT and use
  // Google ID token X replace JWT
  // Google ID token: Google confirm this is Xin.
  // JWT token: Habit Tracker has logged Xin into user ID 15.
  // Bycrypt = password hasing, JWT token = authentication token
  return toAuthResult(newGoogleUser);
}