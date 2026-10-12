import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="group inline-flex items-center gap-2 rounded-xl
        border border-red-200 bg-white px-4 py-2.5
        text-sm font-semibold text-red-600 shadow-sm
        transition-all duration-200
        hover:border-red-300 hover:bg-red-50 hover:shadow-md
        active:scale-95
        disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut
        size={17}
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}