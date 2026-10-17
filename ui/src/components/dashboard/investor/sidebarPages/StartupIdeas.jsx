
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Wallet,
  Users,
  RefreshCw,
  Check,
  X,
  Clock,
  Search,
  Lightbulb,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function StartupIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [notice, setNotice] = useState("");

  // Fetch startup ideas
  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/investor/startup_ideas`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Expected JSON but received:", responseText);

        throw new Error(
          `Expected JSON from the API. Check your API URL and Express route. Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch startup ideas.");
      }

      setIdeas(data.startupIdeas || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Download the startup PDF
  const downloadDocument = async (idea) => {
    try {
      setDownloadingId(idea._id);
      setError("");
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/investor/startup_ideas/${idea._id}/document/download`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = "Unable to download the startup document.";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          message = data.message || message;
        } else {
          const responseText = await response.text();
          console.error("Download API response:", responseText);
          message = `Download failed. Status: ${response.status}`;
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The downloaded PDF is empty.");
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const fileName =
        idea.projectDocument?.fileName || "startup-pitch.pdf";

      link.href = objectUrl;
      link.download = fileName.toLowerCase().endsWith(".pdf")
        ? fileName
        : `${fileName}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Revoke after the browser has started processing the download
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      setNotice(`Downloaded the document for "${idea.title}".`);
    } catch (err) {
      console.error("PDF download error:", err);
      setError(err.message || "Unable to download the PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Approve or reject a startup idea
  const reviewIdea = async (id, reviewStatus) => {
    const action = reviewStatus.toLowerCase();

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this startup idea?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setError("");
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/investor/startup_ideas/${id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ reviewStatus }),
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Expected JSON but received:", responseText);

        throw new Error(
          `Expected JSON from the API. Check your API URL and Express route. Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update review status.");
      }

      setIdeas((previousIdeas) =>
        previousIdeas.map((idea) =>
          idea._id === id
            ? {
                ...idea,
                reviewStatus: data.startupIdea.reviewStatus,
              }
            : idea
        )
      );

      setNotice(`Idea ${action}d successfully.`);
    } catch (err) {
      setError(err.message || "Unable to update the idea.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatFunding = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const getStatus = (idea) => idea.reviewStatus || "Pending";

  const filteredIdeas = ideas.filter((idea) => {
    const searchText = search.toLowerCase();

    const matchesSearch = [
      idea.title,
      idea.shortDescription,
      idea.domain,
      idea.location,
      idea.startup?.companyName,
      idea.startup?.founderName,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    const matchesFilter =
      filter === "All" || getStatus(idea) === filter;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = ideas.filter(
    (idea) => getStatus(idea) === "Pending"
  ).length;

  const approvedCount = ideas.filter(
    (idea) => getStatus(idea) === "Approved"
  ).length;

  const rejectedCount = ideas.filter(
    (idea) => getStatus(idea) === "Rejected"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center bg-white text-black">
        <RefreshCw className="mr-3 animate-spin" size={20} />
        <span>Loading startup ideas...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 text-black sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>Investor Dashboard</span>
            <span>/</span>
            <span className="text-black">Startup Ideas</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Startup Ideas
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Explore startup opportunities, download pitch decks, and review submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchIdeas}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-100 sm:self-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={19} />

          <div className="flex-1">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
          </div>

          <button
            type="button"
            onClick={fetchIdeas}
            className="text-sm font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success message */}
      {notice && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-gray-300 px-4 py-3 text-sm"
        >
          {notice}
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Ideas"
          value={ideas.length}
          icon={<Lightbulb size={20} />}
        />

        <SummaryCard
          title="Pending Review"
          value={pendingCount}
          icon={<Clock size={20} />}
        />

        <SummaryCard
          title="Approved"
          value={approvedCount}
          icon={<Check size={20} />}
        />

        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          icon={<X size={20} />}
        />
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by idea, domain, startup..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black"
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Ideas list */}
      {filteredIdeas.length === 0 ? (
        <div className="rounded-xl border border-gray-200 px-5 py-16 text-center">
          <Lightbulb size={42} className="mx-auto mb-4 text-gray-400" />

          <h2 className="text-lg font-semibold">
            {ideas.length === 0
              ? "No startup ideas submitted yet"
              : "No matching ideas found"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {ideas.length === 0
              ? "Startup submissions will appear here automatically."
              : "Try another search term or status filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredIdeas.map((idea) => {
            const status = getStatus(idea);
            const isProcessing = processingId === idea._id;
            const isDownloading = downloadingId === idea._id;
            const isPending = status === "Pending";
            const hasDocument = Boolean(idea.projectDocument);

            return (
              <article
                key={idea._id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-400"
              >
                {/* Card heading */}
                <div className="border-b border-gray-200 p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold">
                      {idea.domain}
                    </span>

                    <StatusBadge status={status} />
                  </div>

                  <h2 className="text-xl font-bold">{idea.title}</h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {idea.shortDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={16} />
                      {idea.startup?.companyName ||
                        idea.startup?.founderName ||
                        "Startup"}
                    </span>

                    {idea.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={16} />
                        {idea.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Funding and stage */}
                <div className="grid grid-cols-2 border-b border-gray-200">
                  <div className="border-r border-gray-200 p-5">
                    <p className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                      <Wallet size={15} />
                      Funding Required
                    </p>

                    <p className="text-lg font-bold">
                      {formatFunding(idea.fundingRequired)}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="mb-2 text-xs text-gray-500">
                      Development Stage
                    </p>

                    <p className="text-lg font-bold">
                      {idea.stage || "Idea"}
                    </p>
                  </div>
                </div>

                {/* Idea details */}
                <div className="flex-1 space-y-5 p-5 sm:p-6">
                  <DetailSection
                    title="Problem Statement"
                    text={idea.problemStatement}
                  />

                  <DetailSection
                    title="Proposed Solution"
                    text={idea.solution}
                  />

                  {idea.businessModel && (
                    <DetailSection
                      title="Business Model"
                      text={idea.businessModel}
                    />
                  )}

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Users size={16} />
                      Target Consumers
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {(idea.targetConsumers || []).map(
                        (consumer, index) => (
                          <span
                            key={`${consumer}-${index}`}
                            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
                          >
                            {consumer}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* PDF document and download */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <FileText size={16} />
                      Project Document
                    </h3>

                    {hasDocument ? (
                      <>
                        <p className="mb-3 break-words text-sm text-gray-600">
                          {idea.projectDocument?.fileName ||
                            "Startup pitch deck PDF"}
                        </p>

                        <button
                          type="button"
                          onClick={() => downloadDocument(idea)}
                          disabled={isDownloading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Download Pitch Deck
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No PDF document attached.
                      </p>
                    )}
                  </div>

                  {idea.createdAt && (
                    <p className="text-xs text-gray-400">
                      Submitted on{" "}
                      {new Date(idea.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>

                {/* Approval actions */}
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  {isPending ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => reviewIdea(idea._id, "Approved")}
                        disabled={isProcessing}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={17} />
                        {isProcessing ? "Processing..." : "Approve Idea"}
                      </button>

                      <button
                        type="button"
                        onClick={() => reviewIdea(idea._id, "Rejected")}
                        disabled={isProcessing}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-black bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={17} />
                        Reject Idea
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-600">
                        Review completed
                      </span>

                      <span className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold">
                        {status}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-gray-600">{icon}</span>
      </div>

      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold">
      {status}
    </span>
  );
}

function DetailSection({ title, text }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>

      <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
        {text || "Not provided"}
      </p>
    </div>
  );
}