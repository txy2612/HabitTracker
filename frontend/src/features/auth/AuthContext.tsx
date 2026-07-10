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

// Purpose: desc info AuthContext provides
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
  children: ReactNode; //any valid React content
};

// create context (empty shared storage)
// < A|B > - authContext can either be A or B
// (null) -> starts with null
const AuthContext = createContext<AuthContextValue | null>(null);

// AuthProvider = Auth Manager - manage authentication
export function AuthProvider({ children }: AuthProviderProps) {
  // () => authService.getSession()
  // only runs on ini session, X run getsession on ev re-render
  const [session, setSession] = useState<StoredAuthSession | null>(() => authService.getSession());

  async function login(input: LoginInput) {
    // nextSession = { token, user :{id, name, email}, provider}
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

  // Note: localStorage =/ React (need update both)
  function logout() {
    authService.logout();//clears saved session from localStorage
    setSession(null);// updates React state
  }

  useEffect(() => {
    function syncSessionFromStorage() {
      setSession(authService.getSession());
    }

    // listens to change in localStorage
    // if user logs in/out in another tab -> update this tab's session too
    window.addEventListener("storage", syncSessionFromStorage);

    return () => {
      window.removeEventListener("storage", syncSessionFromStorage);
    };
  }, []);

  return (
    // provider shares auth data w entire app
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
      {children} {/* all components in provider can use this value */}
    </AuthContext.Provider>
  );
}

// Purpose: NONID write useContext(AuthContext) evwere -> useAuth()
// functionName(para) : returnType
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return value;
}
