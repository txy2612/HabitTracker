import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../../shared/httpErrors.js";
import {
  createUser,
  createGoogleUser,
  findUserByEmail,
  findUserByGoogleSub,
  convertToGoogleOnlyUser,
  type UserRow,
} from "./auth.repository.js";
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

// Dependency shape
// loginWithGoogle() = receptionist that help check in in hotel
// dependencies = the guest-record system 
// to search guest by identity, fund existing email, registration for new guest
type GoogleLoginDependencies = {
  findByGoogleSub: typeof findUserByGoogleSub;
  findByEmail: typeof findUserByEmail;
  createGoogleUser: typeof createGoogleUser;
  convertToGoogleOnlyUser: typeof convertToGoogleOnlyUser;
};

// actual dependency object
// containing repo functions
/* : GoogleLoginDependencies  -> make sure it follows this type

 */
const googleLoginDependencies: GoogleLoginDependencies = {
  findByGoogleSub: findUserByGoogleSub,
  findByEmail: findUserByEmail,
  createGoogleUser,// short for: createGoogleUser : createGoogleUser
  convertToGoogleOnlyUser,// short form
};


function toAuthResult(user: UserRow) {
  return {
    // create a JWT token
    token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function registerUser(input: RegisterInput) {
  //1. check if email already exists
  const existingUser = await findUserByEmail(input.email);

  // if its an existing user, and google_sub is not null = user already has google account
  if (existingUser?.google_sub) {
    throw new HttpError(409, "Use your existing Google login method.");
  }

  if (existingUser) {
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

  if (user?.google_sub && !user.password_hash) {
    throw new HttpError(409, "Use your existing Google login method.");
  }

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
  dependencies: GoogleLoginDependencies = googleLoginDependencies,
){
  //1. Verify the credential and extract trusted Google details
  const identity = await verifyCredential(input.credential);

  //2. Check whether this Google account has signed in before
  const existingGoogleUser = await dependencies.findByGoogleSub(identity.sub);

  if(existingGoogleUser){
    if (!existingGoogleUser.password_hash){
      return toAuthResult(existingGoogleUser);
    }

    const convertedUser = await dependencies.convertToGoogleOnlyUser({
      userId: existingGoogleUser.id,
      googleSub: identity.sub,
    });

    return toAuthResult(convertedUser);
  }

  //3. A verified Google email can safely connect to the matching account.
  const existingEmailUser = await dependencies.findByEmail(identity.email);

  if(existingEmailUser){
    // Does the user  currently have Google identity
    // Is the stored Google identity (Google token) different from the Google account currently signing in?
    if (
      existingEmailUser.google_sub && existingEmailUser.google_sub !== identity.sub
    ){
      throw new HttpError(409,
        "This email is connected to another Google identity.",
      );
    }

    const convertedUser = await dependencies.convertToGoogleOnlyUser({
      userId: existingEmailUser.id,
      googleSub: identity.sub,
    });

    return toAuthResult(convertedUser);
  }

  // 4. It is a new Google user on Habit Tracker, so create the Habit Tracker account 
  const newGoogleUser = await dependencies.createGoogleUser({
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
