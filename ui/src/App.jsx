
import { useCallback, useEffect, useState } from "react";

import AuthPage from "./components/auth/AuthPage";
import InvestorDashboard from "./components/dashboard/investor/Dashboard";
import StartupDashboard from "./components/dashboard/startup/Dashboard";

import { api } from "./utils/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

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
    window.history.replaceState({}, "", "/");
  }
}

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">
        Loading IdeaSpark...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (user.role === "startup") {
    return (
      <StartupDashboard user={user} onLogout={onLogout} />
    );
  }

  if (user.role === "investor") {
    return (
      <InvestorDashboard user={user} onLogout={onLogout} />
    );
  }

  return (
    <div className="grid min-h-screen place-items-center text-slate-600">
      Unsupported account role: {user.role}
    </div>
  );
}
