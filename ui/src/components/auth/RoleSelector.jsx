
import { ROLE_META } from "../../constants/roleMeta";

export default function RoleSelector({
  role,
  onSwitchRole,
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
      {Object.keys(ROLE_META).map((itemRole) => (
        <button
          key={itemRole}
          type="button"
          onClick={() => onSwitchRole(itemRole)}
          className={`rounded-lg py-2.5 text-sm font-semibold transition ${
            role === itemRole
              ? "bg-white text-slate-900 shadow"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {ROLE_META[itemRole].label}
        </button>
      ))}
    </div>
  );
}
