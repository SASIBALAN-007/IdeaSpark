
import { useEffect, useState } from "react";
import { api } from "../../../utils/api";

export default function InvestorDashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api("/investor/dashboard")
      .then(setDashboard)
      .catch((err) => setError(err.message));
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
      title: "Discover Startups",
      description: "Explore startups and innovative business ideas.",
    },
    {
      title: "Investments",
      description: "Manage your investment opportunities.",
    },
    {
      title: "Saved Startups",
      description: "Keep track of startups that interest you.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-emerald-700">
          IdeaSpark
        </h1>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      {/* Dashboard content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-600 p-8 text-white sm:p-10">
          <p className="text-sm text-emerald-100">
            INVESTOR DASHBOARD
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Welcome, {user?.fullName || user?.firmName || "Investor"}!
          </h2>

          <p className="mt-3 max-w-xl text-emerald-50">
            Discover innovative startups and explore new investment
            opportunities with IdeaSpark.
          </p>
        </section>

        {/* Feature cards */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* Backend response */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">
            Account status
          </h3>

          {error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : dashboard ? (
            <p className="mt-3 text-sm text-emerald-700">
              {dashboard.message || "Investor access granted."}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Loading dashboard...
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
