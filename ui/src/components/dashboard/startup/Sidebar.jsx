import LogoutButton from "./Logout";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Investors", path: "/startup/investors" },
  { label: "Ask for Investment", path: "/startup/ask-investment" },
  { label: "My Ideas", path: "/startup/ideas" },
  { label: "My Account", path: "/startup/user_account" },
];

export default function Sidebar({onLogout}) {
  return (
    <aside className="min-h-screen w-full border-r border-slate-200 bg-white md:w-64 md:shrink-0">
      <div className="border-b border-slate-100 px-6 py-6">
        <h1 className="text-xl font-bold text-indigo-700">
          IdeaSpark<span className="text-slate-900">.</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Startup workspace
        </p>
      </div>

      <nav className="space-y-1 p-3">
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
        <LogoutButton onLogout={onLogout} />
      </nav>
    </aside>
  );
}
