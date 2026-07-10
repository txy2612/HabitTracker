import { useEffect, useRef, useState } from "react";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { useAuth } from "./features/auth/AuthContext";
import { DashboardPage } from "./features/habits/pages/DashboardPage";

function App() {
  // destructuring 
  const { isAuthenticated } = useAuth();

  // < A | B > : this state is ONLY allow to have A or B
  // setAuthScreen("Dashboard") NOT ALLOWED
  // ("login") -> starts with login
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");

  // useRef() - used when we want previous value to stay when re-renders
  // uses isAuthenticated once—when the ref is first created
  const wasAuthenticated = useRef(isAuthenticated);

   useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      setAuthScreen("login");
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    if (authScreen === "register") {
      return <RegisterPage onShowLogin={() => setAuthScreen("login")} />;
    }

    return <LoginPage onShowRegister={() => setAuthScreen("register")} />;
  }
  return <DashboardPage />;
}

export default App;
