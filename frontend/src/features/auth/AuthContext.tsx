import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
/* createContext： create shared storage;
   useContext: read shared storage
*/
import type {
  AuthProvider as AuthProviderType,
  AuthResult,
  AuthUser,
  LoginInput,
  RegisterInput,
  StoredAuthSession,
} from "../../shared/types/api.types";
import { authService } from "./authService";

// Purpose: desc info AuthContext(this file) provides
// when they call const auth = useAuth() -> they get this object
export type AuthContextValue = {
  session: StoredAuthSession | null;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<StoredAuthSession>;
  register: (input: RegisterInput) => Promise<StoredAuthSession>;
  completeSignIn: (auth: AuthResult, provider?: AuthProviderType) => StoredAuthSession;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

// create context (empty shared storage)
const AuthContext = createContext<AuthContextValue | null>(null);

// AuthProvider = Auth Manager - manage authentication
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<StoredAuthSession | null>(() => authService.getSession());

  async function login(input: LoginInput) {
    const nextSession = await authService.login(input);
    setSession(nextSession);

    return nextSession;
  }

  async function register(input: RegisterInput) {
    const nextSession = await authService.register(input);
    setSession(nextSession);

    return nextSession;
  }

  function completeSignIn(auth: AuthResult, provider: AuthProviderType = "password") {
    const nextSession = authService.completeSignIn(auth, provider);
    setSession(nextSession);

    return nextSession;
  }

  function logout() {
    authService.logout();
    setSession(null);
  }

  useEffect(() => {
    function syncSessionFromStorage() {
      setSession(authService.getSession());
    }

    window.addEventListener("storage", syncSessionFromStorage);

    return () => {
      window.removeEventListener("storage", syncSessionFromStorage);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        token: session?.token ?? null,
        isAuthenticated: session !== null,
        login,
        register,
        completeSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return value;
}
