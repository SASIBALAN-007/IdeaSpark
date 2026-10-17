
import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

//Auth//
import AuthPage from "./components/auth/AuthPage";

// investors//
import InvestorDashboard from "./components/dashboard/investor/Dashboard";
import InvestorMyaccount from "./components/dashboard/investor/sidebarPages/Myaccount";
import InvestmentRequests from "./components/dashboard/investor/sidebarPages/InvestmentRequests";
import InvestmentStartupIdeas from "./components/dashboard/investor/sidebarPages/StartupIdeas";
import AboutStartups from "./components/dashboard/investor/sidebarPages/Sartups";

//startup//
import StartupDashboard from "./components/dashboard/startup/Dashboard";
import StartupAskInvestors from "./components/dashboard/startup/sidebarpages/Investors"
import StartupAskForInvestment from "./components/dashboard/startup/sidebarpages/AskForInvestment";
import StartupMyAccount from "./components/dashboard/startup/sidebarpages/MyAccount";
import StartupMyIdeas from "./components/dashboard/startup/sidebarpages/MyIdeas"

// api middleware
import { api } from "./utils/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const loadMe = useCallback(async () => {
    try {
      const data = await api("/auth/me");
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadMe();

    window.addEventListener("auth-changed", loadMe);

    return () => {
      window.removeEventListener("auth-changed", loadMe);
    };
  }, [loadMe]);

  async function onLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">
        Loading IdeaSpark...
      </div>
    );
  }

  // Send authenticated users straight to their dashboard, and keep the
  // browser URL in sync with where they actually are.
  const homeFor = (role) => (role === "startup" ? "/startup" : "/investor");

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to={homeFor(user.role)} replace /> : <AuthPage />
        }
      />
                {/* startup routes*/}
      <Route
        path="/startup"
        element={
          user?.role === "startup" ? (
            <StartupDashboard user={user} onLogout={onLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/startup/investors"
        element={<StartupAskInvestors />}
      />

      <Route
        path="/startup/ask-investment"
        element={<StartupAskForInvestment />}
      />
      <Route
        path="/startup/ideas"
        element={<StartupMyIdeas />}
      />

      <Route
        path="/startup/user_account"
        element={<StartupMyAccount />}
      />
      {/* investors routes*/}
      <Route
        path="/investor"
        element={
          user?.role === "investor" ? (
            <InvestorDashboard user={user} onLogout={onLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
      path= "/investor/user_account"
      element = { < InvestorMyaccount /> }
      />
      <Route
      path= "/investor/startup_ideas"
      element = { < InvestmentStartupIdeas /> }
      />
      <Route
      path= "/investor/investment_request"
      element = { < InvestmentRequests /> }
      />
      <Route
      path= "/investor/startups"
      element = { < AboutStartups /> }
      />

      {/* Unknown path -> back to the landing/auth screen. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
