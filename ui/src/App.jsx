
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

// Route guard: only users with the required role may render the page.
// Guests are sent to "/" (the auth screen) and authenticated users with a
// different role are bounced to their own dashboard by the "/" route.
function RequireRole({ user, role, children }) {
  if (user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

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
          <RequireRole user={user} role="startup">
            <StartupDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />
      <Route
        path="/startup/investors"
        element={
          <RequireRole user={user} role="startup">
            <StartupAskInvestors />
          </RequireRole>
        }
      />

      <Route
        path="/startup/ask-investment"
        element={
          <RequireRole user={user} role="startup">
            <StartupAskForInvestment />
          </RequireRole>
        }
      />
      <Route
        path="/startup/ideas"
        element={
          <RequireRole user={user} role="startup">
            <StartupMyIdeas />
          </RequireRole>
        }
      />

      <Route
        path="/startup/user_account"
        element={
          <RequireRole user={user} role="startup">
            <StartupMyAccount />
          </RequireRole>
        }
      />
      {/* investors routes*/}
      <Route
        path="/investor"
        element={
          <RequireRole user={user} role="investor">
            <InvestorDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />
      <Route
      path= "/investor/user_account"
      element={
        <RequireRole user={user} role="investor">
          <InvestorMyaccount />
        </RequireRole>
      }
      />
      <Route
      path= "/investor/startup_ideas"
      element={
        <RequireRole user={user} role="investor">
          <InvestmentStartupIdeas />
        </RequireRole>
      }
      />
      <Route
      path= "/investor/investment_request"
      element={
        <RequireRole user={user} role="investor">
          <InvestmentRequests />
        </RequireRole>
      }
      />
      <Route
      path= "/investor/startups"
      element={
        <RequireRole user={user} role="investor">
          <AboutStartups />
        </RequireRole>
      }
      />

      {/* Unknown path -> back to the landing/auth screen. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
