import type { AuthProvider, AuthResult, AuthUser, StoredAuthSession } from "../../shared/types/api.types";

// This file: creates somewhere permanent to store the token
// so when refresh -> token not lost -> X "Nobody is logged in"
// token is stored in localStorage (key, value)

// key with matching session values (token, user)
const AUTH_SESSION_STORAGE_KEY = "habitTracker.auth.session";

// window: a toolbox that provides fetch() document. localStorage ...
function getStorage(): Storage | null {
  // Am I running in a browser? 
  // bcz sometimes it runs w/o browser
  if (typeof window === "undefined") {
    return null;
  }

  // YES -> browser creates localStorage -> return it
  return window.localStorage;
}

// Purpose: called imme after login 
// login -> backend returns userId & token -> setItem()
export function saveAuthSession(auth: AuthResult, provider: AuthProvider = "password"): void {
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
export function getStoredAuthSession(): StoredAuthSession | null {
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
export function getStoredAuthToken(): string | null {
  return getStoredAuthSession()?.token ?? null;
}

export function getStoredAuthUser(): AuthUser | null {
  return getStoredAuthSession()?.user ?? null;
}

export function clearAuthSession(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

// Check whether a session exists:
// session or null -> true or false
export function hasStoredAuthSession(): boolean {
  return getStoredAuthSession() !== null;
}
