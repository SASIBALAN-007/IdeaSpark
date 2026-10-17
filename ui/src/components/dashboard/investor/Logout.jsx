import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut || typeof onLogout !== "function") return;

    setLoggingOut(true);

    try {
      await onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3
        text-sm font-semibold text-red-600 transition
        hover:bg-red-50 disabled:cursor-not-allowed
        disabled:opacity-60"
    >
      <LogOut size={18} />
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}