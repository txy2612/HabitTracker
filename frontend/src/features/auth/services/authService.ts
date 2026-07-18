import type {
  AuthProvider,
  AuthResult,
  AuthUser,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  StoredAuthSession,
} from "../../../shared/types/api.types";
import { authApi } from "../api/authApi";

// this file connects authApi(like frontend routes/controller) & browser storage(like frontend DB?)
// after success API login -> save the session

/*frontend authService runs in browser
  backend authService runs in Node/Express server

  frontend authService = client-side session workflow
  backend authService = server-side auth rules/security
 */

// This file: creates somewhere permanent to store the token
// so when refresh -> token not lost -> X "Nobody is logged in"
// token is stored in localStorage (key, value)
// save, load, clear data -> Knows ntg abt login/logout flow

// key with matching session values (token, user)
const AUTH_SESSION_STORAGE_KEY = "habitTracker.auth.session";

// window: a toolbox that provides fetch() document. localStorage ...
function getStorage(): Storage | null {
  // Am I running in a browser?
  // bcz sometimes it runs w/o browser
  if (typeof window === "undefined") {
    return null;
  }

  /* storage = client-side/window-browser localStorage
    session = data that contains token, user, provider
   */
  // YES -> browser creates localStorage -> return it
  return window.localStorage;
}

// Purpose: called imme after login
// login -> backend returns userId & token -> setItem()
function saveAuthSession(auth: AuthResult, provider: AuthProvider = "password"): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const session: StoredAuthSession = {
    token: auth.token,
    user: auth.user,
    provider,
  };

  storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

//
function getStoredAuthSession(): StoredAuthSession | null {
  // 1. read localStorage
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const storedValue = storage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  // 2. Convert back into an object
  try {
    const parsedValue = JSON.parse(storedValue) as Partial<StoredAuthSession>;

    if (
      typeof parsedValue.token !== "string" ||
      typeof parsedValue.user?.id !== "string" ||
      typeof parsedValue.user?.name !== "string" ||
      typeof parsedValue.user?.email !== "string"
    ) {
      storage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }

    const provider = parsedValue.provider === "google" ? "google" : "password";

    return {
      token: parsedValue.token,
      user: parsedValue.user,
      provider,
    };
  } catch {
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

// ?. means: only continue if it is not null
function getStoredAuthToken(): string | null {
  return getStoredAuthSession()?.token ?? null;
}

function getStoredAuthUser(): AuthUser | null {
  return getStoredAuthSession()?.user ?? null;
}

function clearAuthSession(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

// Check whether a session exists:
// session or null -> true or false
function hasStoredAuthSession(): boolean {
  return getStoredAuthSession() !== null;
}

/* Meaning: 
Give me login result (backend auth data and provider type). I will save it.
Then I will return session object React can use
 */
function persistSession(auth: AuthResult, provider: AuthProvider): StoredAuthSession {
  saveAuthSession(auth, provider);

  // after register succeeds, frontend saves 
  return {
    token: auth.token,
    user: auth.user,
    provider,// "password" or "google"
  };
}

export const authService = {
  // functionName (para): return type {}
  getSession(): StoredAuthSession | null {
    return getStoredAuthSession();
  },

  getToken(): string | null {
    return getStoredAuthToken();
  },

  getUser(): AuthUser | null {
    return getStoredAuthUser();
  },

  hasSession(): boolean {
    return hasStoredAuthSession();
  },

  /* 1) call backend API
     2) save successful auth result as a password-based session
  */
  // async functionName(paraName : paraType) : returnType
  // input = { name, email, pw }
  // async -> inside has await
  async register(input: RegisterInput): Promise<StoredAuthSession> {// promise to return StoredAuthSession later

    // call backend + wait -> fin + response
    const response = await authApi.register(input);

    return persistSession(response.data, "password");
  },

  async login(input: LoginInput): Promise<StoredAuthSession> {
    const response = await authApi.login(input);

    return persistSession(response.data, "password");
  },

  async googleLogin(
    input: GoogleLoginInput,
  ): Promise<StoredAuthSession>{
    //authApi.google() = endpoint wrapper in authApi (the request sender AKA opposite of controller)
    const response = await authApi.google(input);

    // frontend save the session, using returned result
    // provider: "password" [password login]
    // provider: "google" [Google login]
    return persistSession(response.data, "google");
  },//the comma separates googleLogin & logout inside the object

  logout(): void{
    clearAuthSession();
  },
};
