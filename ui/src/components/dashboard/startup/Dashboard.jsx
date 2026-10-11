
import { useEffect, useState } from "react";
import { api } from "../../../utils/api";

export default function StartupDashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    api("/startup/dashboard")
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  const features = [
    {
      number: "01",
      title: "Company Profile",
      description: "Manage your startup details and business information.",
    },
    {
      number: "02",
      title: "Find Investors",
      description: "Discover potential investors for your business.",
    },
    {
      number: "03",
      title: "Funding Proposals",
      description: "Organize your funding requirements and proposals.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-700">
            IdeaSpark<span className="text-slate-900">.</span>
          </h1>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:inline-block">
              Startup
            </span>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 p-7 text-white shadow-lg sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
            Startup workspace
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome, {user?.founderName || user?.companyName || "Founder"}.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
            Turn your vision into reality. Build your company profile,
            find potential investors, and explore funding opportunities.
          </p>

          <div className="mt-7 inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-50">
            {user?.companyName || "Your startup journey starts here"}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Your workspace
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage the key areas of your startup journey.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
              >
                <p className="text-sm font-semibold text-indigo-600">
                  {feature.number}
                </p>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Account status</h2>

          {error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : dashboard ? (
            <p className="mt-3 text-sm text-emerald-700">
              {dashboard.message || "Startup dashboard access confirmed."}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Checking your account access...
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
