import { useState } from "react";

import Logo from "../Logo";
import BrandPanel from "./BrandPanel";
import RoleSelector from "./RoleSelector";
import AuthFields, { getAuthFields } from "./AuthFields";
import AuthModeToggle from "./AuthModeToggle";
import FormStatus from "./FormStatus";

import { ROLE_META } from "../../constants/roleMeta";
import { api } from "../../utils/api";


export default function AuthPage() {
  const [role, setRole] = useState("startup");
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({});
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const meta = ROLE_META[role];
  const fields = getAuthFields(role, mode);

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  function switchRole(nextRole) {
    setRole(nextRole);
    setForm({});
    setStatus({ type: "", msg: "" });
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setForm({});
    setStatus({ type: "", msg: "" });
  }


async function onSubmit(event) {
  event.preventDefault();

  setLoading(true);
  setStatus({ type: "", msg: "" });

  try {
    const data = await api(`/auth/${role}/${mode}`, {
      method: "POST",
      body: form,
    });

    setStatus({
      type: "success",
      msg: data.message || "Authentication successful!",
    });

    // Notify App to re-check auth. Once the authenticated user is loaded,
    // the route guard redirects to the correct dashboard URL.
    window.dispatchEvent(new Event("auth-changed"));
  } catch (error) {
    setStatus({
      type: "error",
      msg: error.message,
    });
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="relative isolate grid min-h-screen overflow-hidden
     bg-white lg:grid-cols-2">

      {/* Background video across the entire page
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={backgroundvideo} type="video/mp4" />
      </video> */}

      {/* Left branding panel */}
      <BrandPanel meta={meta} />

      {/* Right authentication panel */}
      <section className="relative z-10 flex min-h-screen items-center 
      justify-center px-4 py-8 sm:px-8 lg:px-10">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Logo on mobile */}
          <div className="mb-6 text-black lg:hidden">
            <Logo />
          </div>

          <div className="text-black [&_input+button]:text-black/70
           [&_input]:border-black/30 [&_input]:bg-white [&_input]:text-black
            [&_input]:placeholder:text-black/50 [&_label]:text-black">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/80">
              The IdeaSpark Network
            </p>

            <h1 className="text-3xl font-bold text-black">
              {mode === "signin" ? "Welcome back" : "Join IdeaSpark"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-black/80">
              {mode === "signin"
                ? "Sign in to continue connecting ideas with capital."
                : "Create your account and discover new opportunities."}
            </p>

            {/* Account type selection */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-black">
                Choose your account type
              </p>

              <div className="[&>div]:bg-slate-100 [&_button.bg-white]:text-slate-900
               [&_button:not(.bg-white):hover]:text-black [&_button]:text-black/80">
                <RoleSelector role={role} onSwitchRole={switchRole} />
              </div>
            </div>

            {/* Form heading */}
            <div className="my-4 border-b border-black/20 pb-4">
              <h2 className="font-semibold text-black">
                {mode === "signin"
                  ? `Sign in as ${meta.label}`
                  : `Create your ${meta.label} account`}
              </h2>

              <p className="mt-1 text-sm text-black/80">
                {role === "startup"
                  ? "Connect your startup with investors."
                  : "Discover startups and investment opportunities."}
              </p>
            </div>

            {/* Authentication form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <AuthFields fields={fields} form={form} onChange={update} />

              <FormStatus status={status} />

              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl
                   bg-gradient-to-r ${meta.accent} px-4 py-3 text-sm font-semibold text-white
                    shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg 
                    focus:outline-none focus:ring-2 focus:ring-black/30 disabled:translate-y-0
                     disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}

                {!loading && <span>→</span>}
              </button>
            </form>

            {/* Switch between signin and signup */}
            <div className="[&_button]:text-black [&_p]:text-black/80">
              <AuthModeToggle mode={mode} onSwitchMode={switchMode} />
            </div>

            <p className="mt-5 border-t border-black/20 pt-4 text-center text-xs
             text-black/70">
              Secure access · © {new Date().getFullYear()} IdeaSpark
            </p>
          </div>
        </div>
      </section>

      {/* Entrance animation */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.5s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}