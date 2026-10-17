import { useEffect, useState } from "react";
import { api } from "../../../../utils/api";

function Startups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStartup, setSelectedStartup] = useState(null);

  useEffect(() => {
    async function fetchStartups() {
      try {
        const data = await api("/investors/startups");
        setStartups(data.startups || []);
      } catch (err) {
        setError(err.message || "Failed to fetch startups");
      } finally {
        setLoading(false);
      }
    }

    fetchStartups();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-10 text-center text-black">
        Loading startups...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-10 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black sm:px-8 lg:px-12">
      <style>{`
        html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            IdeaSpark Network
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Startups
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Explore innovative companies and discover investment opportunities.
          </p>
        </header>

        {/* Count */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Startup Directory
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {startups.length} startups
          </span>
        </div>

        {/* Startup list */}
        {startups.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="font-semibold">No startups found</h2>

            <p className="mt-2 text-sm text-gray-500">
              Startup profiles will appear here when companies register.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {startups.map((startup) => {
              const isSelected = selectedStartup === startup._id;

              return (
                <article
                  key={startup._id}
                  className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
                    isSelected
                      ? "border-black shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {/* Clickable summary */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStartup(
                        isSelected ? null : startup._id
                      )
                    }
                    aria-expanded={isSelected}
                    className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                  >
                    {/* Company initial */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                      {(startup.companyName || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Summary details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-black">
                        {startup.companyName || "Startup"}
                      </h3>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {startup.founderName || "Founder not specified"}
                      </p>

                      <p className="mt-2 truncate text-xs text-gray-600">
                        {startup.industry || "Industry not specified"}
                      </p>
                    </div>

                    {/* Expand icon */}
                    <span className="shrink-0 text-xl text-gray-500">
                      {isSelected ? "−" : "+"}
                    </span>
                  </button>

                  {/* Expanded company details */}
                  {isSelected && (
                    <div className="border-t border-gray-200 bg-gray-50 px-5 py-5 sm:px-7">
                      <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Startup Details
                      </h4>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Detail
                          label="Company Name"
                          value={startup.companyName}
                        />

                        <Detail
                          label="Founder Name"
                          value={startup.founderName}
                        />

                        <Detail
                          label="Email Address"
                          value={startup.email}
                        />

                        <Detail
                          label="Industry"
                          value={startup.industry}
                        />

                        <Detail
                          label="Website"
                          value={startup.website}
                          isWebsite
                        />

                        <Detail
                          label="Registered On"
                          value={
                            startup.createdAt
                              ? new Date(
                                  startup.createdAt
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : null
                          }
                        />

                        <Detail
                          label="Startup ID"
                          value={startup._id}
                        />

                        <div className="sm:col-span-2">
                          <Detail
                            label="Company Description"
                            value={startup.description}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value, isWebsite = false }) {
  const displayValue = value || "Not provided";

  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      {isWebsite && value ? (
        <a
          href={
            /^https?:\/\//i.test(value)
              ? value
              : `https://${value}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm font-medium text-black underline underline-offset-4 hover:text-gray-500"
        >
          {value}
        </a>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
          {displayValue}
        </p>
      )}
    </div>
  );
}

export default Startups;