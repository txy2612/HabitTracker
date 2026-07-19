import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
/* createContext： create shared storage;
   useContext: read shared storage
*/
import type {
  AuthUser,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  StoredAuthSession,
} from "../../../shared/types/api.types";
import { authService } from "../services/authService";

/* Purpose of Context:
   - authenticated data is used evwhere in the app
   - instead of prop drilling
   - create a shared storage (context) where they can access data more easily
 */

// Purpose: desc info AuthContext provides
// when they call const auth = useAuth() -> they get this object
export type AuthContextValue = {
  session: StoredAuthSession | null;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<StoredAuthSession>; 
  googleLogin: (input: GoogleLoginInput ) => Promise<StoredAuthSession>;
  register: (input: RegisterInput) => Promise<StoredAuthSession>;
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

  // Why must context call setSession()?
  // authService saves session into localStorage, but localStorage is NOT React state
  // Result w/o setSession : token stored but React only render login page until refresh
  const [session, setSession] = useState<StoredAuthSession | null>(() => authService.getSession());

  async function login(input: LoginInput) {
    // nextSession = { token, user :{id, name, email}, provider}
    // call authService.login() & pass LoginInput
    // store the return content in nextSession
    const nextSession = await authService.login(input);
    setSession(nextSession);

    return nextSession;
  }

  async function googleLogin(input: GoogleLoginInput){
    const nextSession = await authService.googleLogin(input);

    /* After backend returns token & user
        AuthContext runs: setSession(nextSession)
        → isAuthenticated = true
        → app displays dashboard
      */
    setSession(nextSession);

    return nextSession;
  }

  // auth.register comes from:
  /* This does 2 things:
    1) ask authService to register with backend
    2) Save returned session into React state
  */
  async function register(input: RegisterInput) {
    const nextSession = await authService.register(input);
    setSession(nextSession);//make the app becomes logged in

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
        googleLogin,
        register,
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
