import type {
  AuthProvider,
  AuthResult,
  LoginInput,
  RegisterInput,
  StoredAuthSession,
} from "../../shared/types/api.types";
import { authApi } from "./authApi";
import { clearAuthSession, getStoredAuthSession, saveAuthSession } from "./authStorage";

// this file connects authApi & authStorage
// after success API login -> save the session

// Purpose: decide WHEN to SAVE session (part of login flow)
// Whereas storage X logic, only -> save, load, clear data
// () = parameters 
// 1)var auth, type AuthResult, exp: auth = { token: , user: { id, name, email }}
// 2)var provider type AuthProvider
function persistSession(auth: AuthResult, provider: AuthProvider): StoredAuthSession {
  saveAuthSession(auth, provider);

  return {
    token: auth.token,
    user: auth.user,
    provider,
  };
}

export const authService = {
  // functionName (para): return type {}
  getSession(): StoredAuthSession | null {
    return getStoredAuthSession();
  },

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

  // Keep this generic so a future "Sign in with Google" flow can reuse
  // the same storage and context path by passing provider: "google".
  completeSignIn(auth: AuthResult, provider: AuthProvider = "password"): StoredAuthSession {
    return persistSession(auth, provider);
  },

  logout(): void {
    clearAuthSession();
  },
};
