
import { useEffect, useState } from "react";
import { api } from "../../../utils/api";

export default function UserStats() {
  const [startupCount, setStartupCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api("/investor/usercount")
      .then((data) => {
        if (active) {
          setStartupCount(data.startupUsers);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load startup count");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
        <p className="text-sm font-medium text-slate-500">
          Registered Startups
        </p>

        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : (
          <h2 className="mt-3 text-3xl font-bold text-emerald-700">
            {loading ? "Loading..." : startupCount.toLocaleString()}
          </h2>
        )}

        <p className="mt-2 text-xs text-slate-400">
          Total startups registered on IdeaSpark
        </p>
      </div>
    </section>
  );
}
