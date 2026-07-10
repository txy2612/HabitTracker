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

function persistSession(auth: AuthResult, provider: AuthProvider): StoredAuthSession {
  saveAuthSession(auth, provider);

  return {
    token: auth.token,
    user: auth.user,
    provider,
  };
}

export const authService = {
  getSession(): StoredAuthSession | null {
    return getStoredAuthSession();
  },

  async register(input: RegisterInput): Promise<StoredAuthSession> {
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
