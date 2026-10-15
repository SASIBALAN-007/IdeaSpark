
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function AskForInvestment() {
  const [investors, setInvestors] = useState([]);
  const [form, setForm] = useState({
    investorId: "",
    amount: "",
    equityPercentage: "",
    purpose: "",
    pitch: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch investors
  useEffect(() => {
    async function fetchInvestors() {
      try {
        const response = await fetch(
          `${API}/startup/investors`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load investors");
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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/startup/ask-for-investment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            investorId: form.investorId,
            amount: Number(form.amount),
            equityPercentage: Number(
              form.equityPercentage || 0
            ),
            purpose: form.purpose,
            pitch: form.pitch,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send request"
        );
      }

      setMessage("Investment request sent successfully!");

      setForm({
        investorId: "",
        amount: "",
        equityPercentage: "",
        purpose: "",
        pitch: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-10 text-center text-black">
        Loading investors...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black sm:px-8">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            IdeaSpark Network
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Ask for Investment
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Share your funding requirements with an investor
            and explain how the investment will help your startup.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Investor selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Select Investor *
            </label>

            <select
              name="investorId"
              value={form.investorId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            >
              <option value="">Choose an investor</option>

              {investors.map((investor) => (
                <option
                  key={investor._id}
                  value={investor._id}
                >
                  {investor.fullName || "Investor"}
                  {investor.firmName
                    ? ` — ${investor.firmName}`
                    : ""}
                </option>
              ))}
            </select>

            {investors.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No investors are currently available.
              </p>
            )}
          </div>

          {/* Funding amount */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Investment Amount (₹) *
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="1"
              step="1"
              required
              placeholder="e.g. 1000000"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Equity */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Proposed Equity (%)
            </label>

            <input
              type="number"
              name="equityPercentage"
              value={form.equityPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />

            <p className="mt-1 text-xs text-gray-500">
              Enter the proposed ownership percentage, if applicable.
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Funding Purpose *
            </label>

            <select
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            >
              <option value="">Select a purpose</option>
              <option value="Product development">
                Product development
              </option>
              <option value="Marketing and sales">
                Marketing and sales
              </option>
              <option value="Hiring and operations">
                Hiring and operations
              </option>
              <option value="Research and development">
                Research and development
              </option>
              <option value="Business expansion">
                Business expansion
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Business pitch */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Business Pitch *
            </label>

            <textarea
              name="pitch"
              value={form.pitch}
              onChange={handleChange}
              required
              minLength={10}
              rows={5}
              placeholder="Explain your startup, the problem you solve, your solution, and why you need investment..."
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Feedback */}
          {message && (
            <div
              role="status"
              className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-black"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              submitting ||
              investors.length === 0
            }
            className="w-full rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Sending Request..."
              : "Send Investment Request"}
          </button>

          <p className="text-center text-xs text-gray-500">
            Please review your funding details before submitting.
          </p>
        </form>
      </div>
    </main>
  );
}
