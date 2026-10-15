
import { useEffect, useState } from "react";

function Investors() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  useEffect(() => {
    async function fetchInvestors() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/startup/investors",
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch investors");
        }

        setInvestors(data.investors || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvestors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-10 text-center text-black">
        Loading investors...
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
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            IdeaSpark Network
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Investors
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Explore investors and discover funding opportunities.
          </p>
        </header>

        {/* Count */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Investor Directory
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {investors.length} investors
          </span>
        </div>

        {/* Investor list */}
        {investors.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="font-semibold">No investors found</h2>
            <p className="mt-2 text-sm text-gray-500">
              Investor profiles will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {investors.map((investor) => {
              const isSelected =
                selectedInvestor === investor._id;

              return (
                <article
                  key={investor._id}
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
                      setSelectedInvestor(
                        isSelected ? null : investor._id
                      )
                    }
                    aria-expanded={isSelected}
                    className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                  >
                    {/* Initial avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                      {(investor.fullName || investor.firmName || "I")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Minimum details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-black">
                        {investor.fullName || "Investor"}
                      </h3>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {investor.firmName || "Independent Investor"}
                      </p>

                      <p className="mt-2 truncate text-xs text-gray-600">
                        {Array.isArray(investor.investmentFocus)
                          ? investor.investmentFocus.join(", ") ||
                            "Investment focus not specified"
                          : investor.investmentFocus ||
                            "Investment focus not specified"}
                      </p>
                    </div>

                    {/* Expand icon */}
                    <span className="shrink-0 text-xl text-gray-500">
                      {isSelected ? "−" : "+"}
                    </span>
                  </button>

                  {/* Full details */}
                  {isSelected && (
                    <div className="border-t border-gray-200 bg-gray-50 px-5 py-5 sm:px-7">
                      <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Investor Details
                      </h4>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Detail
                          label="Full Name"
                          value={investor.fullName}
                        />

                        <Detail
                          label="Firm Name"
                          value={investor.firmName}
                        />

                        <Detail
                          label="Email Address"
                          value={investor.email}
                        />

                        <Detail
                          label="Investment Focus"
                          value={investor.investmentFocus}
                        />

                        <Detail
                          label="Investor ID"
                          value={investor._id}
                        />
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

function Detail({ label, value }) {
  const displayValue = Array.isArray(value)
    ? value.join(", ")
    : value;

  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="break-words text-sm font-medium text-gray-900">
        {displayValue || "Not provided"}
      </p>
    </div>
  );
}

export default Investors;
