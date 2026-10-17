import Footer from "./Footer";
import LogoutButton from "./Logout";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Compass,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CircleDollarSign,
  Handshake,
  Target,
} from "lucide-react";

import Sidebar from "./Sidebar";
import UserStats from "./Userstatus";

export default function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const investorName =
    user?.fullName || user?.name || user?.firmName || "Investor";

  const opportunities = [
    {
      number: "01",
      title: "Discover Startups",
      description:
        "Explore ambitious founders, emerging companies, and innovative ideas.",
      icon: Compass,
      action: "Explore opportunities",
      target: "startups",
    },
    {
      number: "02",
      title: "Investment Pipeline",
      description:
        "Keep track of promising startup opportunities and your next moves.",
      icon: TrendingUp,
      action: "View investments",
      target: "investments",
    },
    {
      number: "03",
      title: "Build Connections",
      description:
        "Connect with founders and discover meaningful investment opportunities.",
      icon: Handshake,
      action: "Find founders",
      target: "startups",
    },
  ];

  function handleExplore(target) {
    window.dispatchEvent(
      new CustomEvent("investor:navigate", {
        detail: { target },
      })
    );

    setSidebarOpen(true);
  }

  const filteredOpportunities = opportunities.filter((item) => {
    const query = search.toLowerCase().trim();

    return (
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Sidebar backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
          }`}
      />

      {/* Animated sidebar */}
      {/* Animated sidebar */}
      <aside
        aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col overflow-hidden bg-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar header */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <TrendingUp size={22} />
            </div>

            <span className="text-sm font-black tracking-[2px]">
              IDEASPARK
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            tabIndex={sidebarOpen ? 0 : -1}
            className="rounded-xl border border-gray-200 p-2.5 transition hover:bg-black hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation: scrollbar hidden */}
        <div
          className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onClick={(event) => {
            if (event.target.closest("a, button")) {
              setSidebarOpen(false);
            }
          }}
        >
          <Sidebar onLogout={onLogout} />
        </div>

        {/* Sidebar footer */}
        <div className="flex shrink-0 items-center gap-3 border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black font-bold text-white">
            {investorName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{investorName}</p>
            <p className="mt-1 text-xs text-gray-500">Investor account</p>
          </div>

          <ShieldCheck size={19} className="text-gray-500" />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-xl sm:px-7 lg:px-12">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 transition duration-200 hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-[9px] font-bold tracking-[2px] text-gray-500 sm:text-[10px]">
                INVESTOR WORKSPACE
              </p>
              <h2 className="mt-1 text-sm font-bold sm:text-base">
                Overview
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden h-11 w-52 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-black md:flex lg:w-64">
              <Search size={17} className="shrink-0 text-gray-500" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search opportunities..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-black hover:text-white"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-black" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
              {investorName.charAt(0).toUpperCase()}
            </div>
                        {/* Logout */}
            <div className="w-auto">
              <LogoutButton onLogout={onLogout} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8 lg:px-12">
          {/* Hero */}
          <section className="group relative isolate flex min-h-[430px] items-center overflow-hidden rounded-3xl bg-black px-6 py-10 text-white sm:px-10 lg:min-h-[390px] lg:px-14">
            {/* Animated decorative circles */}
            <div className="pointer-events-none absolute -right-20 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-white/10 transition-transform duration-1000 group-hover:scale-110 sm:-right-10 lg:right-0">
              <div className="absolute inset-8 animate-[spin_35s_linear_infinite] rounded-full border border-dashed border-white/15" />
              <div className="absolute inset-16 rounded-full border border-white/10" />
              <div className="absolute inset-24 animate-pulse rounded-full border border-white/10" />
            </div>

            <div className="pointer-events-none absolute right-[12%] top-[17%] hidden h-28 w-28 rotate-12 items-center justify-center rounded-[28px] border border-white/15 bg-white/[0.04] shadow-2xl transition duration-500 group-hover:rotate-0 lg:flex">
              <TrendingUp size={54} strokeWidth={1.1} />
            </div>

            <div className="pointer-events-none absolute bottom-[14%] right-[20%] hidden animate-[bounce_5s_infinite] items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-lg lg:flex">
              <CircleDollarSign size={25} />
              <div>
                <p className="text-xs font-bold">Ideas into impact</p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Discover. Evaluate. Invest.
                </p>
              </div>
            </div>

            <div className="relative z-10 max-w-2xl animate-[fadeIn_700ms_ease-out]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-[9px] font-bold tracking-[1.5px] text-gray-300 sm:text-[10px]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                YOUR INVESTMENT JOURNEY STARTS HERE
              </div>

              <h1 className="text-4xl font-black leading-[1.08] tracking-[-2px] sm:text-5xl lg:text-6xl">
                Think beyond.
                <br />
                <span className="text-gray-400">
                  Invest in what&apos;s next.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-xs leading-7 text-gray-300 sm:text-sm">
                Welcome back, {investorName}. Discover ambitious founders,
                evaluate promising ideas, and turn new possibilities into
                meaningful investments.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleExplore("startups")}
                  className="group/button inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-xs font-bold text-black transition duration-200 hover:-translate-y-1 hover:bg-gray-200"
                >
                  <Compass size={17} />
                  Explore Startups
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleExplore("investments")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 text-xs font-bold text-white transition duration-200 hover:-translate-y-1 hover:bg-white/10"
                >
                  View Investment Pipeline
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mt-7 flex items-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck size={15} />
                Your investor workspace, all in one place.
              </div>
            </div>

            <span className="absolute bottom-5 right-6 text-[9px] font-bold tracking-[2px] text-gray-500">
              01 / OVERVIEW
            </span>
          </section>

          {/* Statistics */}
          <section className="mt-10 animate-[fadeIn_800ms_ease-out]">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[2px] text-gray-500">
                  YOUR ACTIVITY
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                  Investment Overview
                </h2>
              </div>

              <span className="text-xs text-gray-500">
                Your investor workspace
              </span>
            </div>

            <div className="min-w-0 [&>div]:min-w-0 [&_button]:transition-all [&_button]:duration-200">
              <UserStats />
            </div>
          </section>

          {/* Opportunity cards */}
          <section className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[2px] text-gray-500">
                  MAKE YOUR NEXT MOVE
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                  Explore Your Possibilities
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handleExplore("startups")}
                className="group inline-flex items-center gap-2 text-xs font-bold transition hover:text-gray-500"
              >
                Explore all
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredOpportunities.map((item, index) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.number}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="group flex min-h-[255px] animate-[fadeIn_600ms_ease-out_both] flex-col rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:border-black hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 transition duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                        <Icon size={22} strokeWidth={1.7} />
                      </div>

                      <span className="text-xs font-bold tracking-widest text-gray-400">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-base font-extrabold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleExplore(item.target)}
                      className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold"
                    >
                      {item.action}
                      <ArrowUpRight
                        size={16}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </button>
                  </article>
                );
              })}

              {filteredOpportunities.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
                  <Search className="mx-auto text-gray-400" size={28} />
                  <p className="mt-3 font-bold">No opportunities found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try another search term.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Bottom callout */}
          <section className="mt-10 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:flex-row sm:items-center sm:p-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <Target size={23} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-extrabold">
                Every great investment begins with a conversation.
              </h3>
              <p className="mt-2 text-xs leading-6 text-gray-500">
                Discover promising founders, explore new ideas, and find your
                next investment opportunity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleExplore("startups")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-xs font-bold text-white transition hover:-translate-y-1 hover:bg-gray-800"
            >
              Find Opportunities
              <Sparkles size={16} />
            </button>
          </section>

          {/* Footer */}
          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-gray-200 py-6 text-[10px] text-gray-500 sm:flex-row">
            <span>© {new Date().getFullYear()} IdeaSpark</span>
            <span>Built for forward-thinking investors.</span>
          </footer>
        </main>
      </div>

      {/* Tailwind arbitrary animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div> < Footer />  </div>
    </div>
  );
}
