import { useEffect, useRef, useState } from "react";
import { LoginPage, RegisterPage } from "./features/auth/AuthEntryPages";
import { useAuth } from "./features/auth/AuthContext";
import { DashboardPage } from "./features/habits/pages/DashboardPage";

function App() {
  const { isAuthenticated } = useAuth();
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) setAuthScreen("login");
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  if (isAuthenticated) return <DashboardPage />;
  if (authScreen === "register") {
    return <RegisterPage onShowLogin={() => setAuthScreen("login")} />;
  }
  return <LoginPage onShowRegister={() => setAuthScreen("register")} />;
}

export default App;
