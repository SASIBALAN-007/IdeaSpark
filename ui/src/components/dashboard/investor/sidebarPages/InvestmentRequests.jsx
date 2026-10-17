
import { useEffect, useState } from "react";
import { api } from "../../../../utils/api";
import {
  Banknote,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  Clock,
  FileText,
  Percent,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";

export default function InvestmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api("/investors/investment_request");
      setRequests(data.investmentRequests || []);
    } catch (err) {
      setError(err.message || "Unable to load investment requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const investor = request.investor || {};

    const searchText = [
      investor.name,
      investor.fullName,
      investor.investorName,
      investor.email,
      request.purpose,
      request.pitch,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || request.status === filter;

    return matchesSearch && matchesFilter;
  });

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInvestorName = (investor) =>
    investor?.name ||
    investor?.fullName ||
    investor?.investorName ||
    "Investor";

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-black text-white border-black";
      case "rejected":
        return "bg-white text-black border-black";
      default:
        return "bg-white text-black border-dashed border-gray-500";
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-7 text-black sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              IDEASPARK / STARTUP DASHBOARD
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Investment Requests
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Review funding proposals, explore investor details, and
              track the status of every request.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<FileText size={20} />}
            label="Total Requests"
            value={requests.length}
          />

          <SummaryCard
            icon={<Clock size={20} />}
            label="Pending Requests"
            value={requests.filter((r) => r.status === "pending").length}
          />

          <SummaryCard
            icon={<Banknote size={20} />}
            label="Accepted Requests"
            value={requests.filter((r) => r.status === "accepted").length}
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search investor, email, or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
          >
            <option value="all">All requests</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Request List */}
        <div className="overflow-hidden border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-black px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold">Received Requests</h2>
              <p className="mt-1 text-xs text-gray-500">
                Investment proposals from investors
              </p>
            </div>

            <span className="border border-gray-300 px-3 py-1.5 text-xs font-semibold">
              {filteredRequests.length} FOUND
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-16 text-gray-500">
              <RefreshCw size={26} className="mb-3 animate-spin text-black" />
              <p className="text-sm">Loading investment requests...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <p className="mb-4 text-sm text-black">{error}</p>

              <button
                onClick={fetchRequests}
                className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Try Again
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-gray-200 text-black">
                <Wallet size={24} />
              </div>

              <h3 className="font-bold">No investment requests found</h3>

              <p className="mt-2 text-sm text-gray-500">
                {requests.length === 0
                  ? "New investment requests will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const investor = request.investor || {};
                const investorName = getInvestorName(investor);
                const expanded = selectedRequest === request._id;

                return (
                  <div key={request._id}>
                    {/* Request Row */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRequest(
                          expanded ? null : request._id
                        )
                      }
                      className="flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black bg-black text-lg font-bold text-white">
                          {investorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-black">
                            {investorName}
                          </h3>

                          <p className="mt-1 truncate text-sm text-gray-500">
                            {investor.email || "Email unavailable"}
                          </p>

                          <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                            {request.purpose || "No purpose provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:gap-5">
                        <div className="sm:text-right">
                          <p className="font-bold text-black">
                            {formatAmount(request.amount)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {request.equityPercentage || 0}% equity
                          </p>
                        </div>

                        <span
                          className={`border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(request.status)}`}
                        >
                          {request.status || "pending"}
                        </span>

                        {expanded ? (
                          <ChevronUp size={19} />
                        ) : (
                          <ChevronDown size={19} />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expanded && (
                      <div className="border-t border-gray-200 bg-gray-50 px-5 py-6 sm:px-8">
                        <div className="mb-5 flex items-center gap-2">
                          <Building2 size={19} />
                          <h4 className="font-bold">Request Details</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <Detail
                            icon={<CircleUserRound size={17} />}
                            label="Investor"
                            value={investorName}
                          />

                          <Detail
                            icon={<FileText size={17} />}
                            label="Email"
                            value={investor.email}
                          />

                          <Detail
                            icon={<Banknote size={17} />}
                            label="Requested Investment"
                            value={formatAmount(request.amount)}
                          />

                          <Detail
                            icon={<Percent size={17} />}
                            label="Equity Offered"
                            value={`${request.equityPercentage || 0}%`}
                          />

                          <Detail
                            icon={<CalendarDays size={17} />}
                            label="Request Date"
                            value={formatDate(request.createdAt)}
                          />

                          <Detail
                            icon={<Clock size={17} />}
                            label="Current Status"
                            value={request.status || "pending"}
                          />
                        </div>

                        <div className="mt-4 border border-gray-200 bg-white p-5">
                          <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                            Purpose of Investment
                          </h5>
                          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                            {request.purpose || "Not provided"}
                          </p>
                        </div>

                        <div className="mt-4 border border-gray-200 bg-white p-5">
                          <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                            Investor Pitch
                          </h5>
                          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                            {request.pitch || "Not provided"}
                          </p>
                        </div>

                        {request.startup && (
                          <div className="mt-4 border border-gray-200 bg-white p-5">
                            <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                              Startup Information
                            </h5>

                            <p className="text-sm text-gray-700">
                              Company: {request.startup.companyName || "N/A"}
                            </p>
                            <p className="mt-2 text-sm text-gray-700">
                              Founder: {request.startup.founderName || "N/A"}
                            </p>
                            <p className="mt-2 text-sm text-gray-700">
                              Industry: {request.startup.industry || "N/A"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          IDEASPARK — INVESTMENT MANAGEMENT
        </p>
      </div>
    </main>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="border border-gray-200 bg-white p-5 transition hover:border-black">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>

        <div className="flex h-10 w-10 items-center justify-center border border-gray-200 bg-white text-black">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-black">
        {value}
      </p>
      <div className="mt-4 h-0.5 w-10 bg-black" />
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="break-words text-sm font-semibold text-black">
        {value || "Not provided"}
      </p>
    </div>
  );
}
