import { NavLink } from "react-router-dom";
import LogoutButton from "./Logout";

const menuItems = [
  { label: "Startup", path: "/investor/startups" },
  { label: "Investment Request", path: "/investor/investment_request" },
  { label: "Startup Ideas", path: "/investor/startup_ideas" },
  { label: "My Account", path: "/investor/user_account" },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-6">
        <h1 className="text-xl font-bold text-black">
          IdeaSpark<span className="text-slate-900">.</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Startup workspace
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Menu
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}

        <div className="mt-auto border-t border-slate-100 pt-4">
          <LogoutButton onLogout={onLogout} />
        </div>
      </nav>
    </aside>
  );
}