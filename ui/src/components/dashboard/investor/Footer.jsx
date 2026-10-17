function SparkMark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12-.6-6.3-5.7-11.4-12-12C6.3 11.4 11.4 6.3 12 0z" />
    </svg>
  );
}

const DEFAULT_LINKS = [
  { label: "Overview", href: "#top" },
  { label: "Platform insights", href: "#insights" },
  { label: "Featured ideas", href: "#ideas" },
  { label: "How it works", href: "#process" },
];

export default function Footer({
  links = DEFAULT_LINKS,
  onNavigate = () => {},
  onLogout = () => {},
}) {
  const linkClass =
    "transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <footer className="border-t border-white/15 bg-black px-6 pb-8 pt-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <SparkMark className="h-6 w-6" />
              Idea Spark
            </a>
            <p className="mt-4 max-w-xs leading-relaxed text-white/60">
              A platform where investors and founders meet around early-stage ideas.
            </p>
          </div>

          <nav aria-label="Explore">
            <p className="text-sm font-semibold">Explore</p>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={linkClass}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Your account">
            <p className="text-sm font-semibold">Your account</p>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <button onClick={() => onNavigate("/investor/startups")} className={linkClass}>startups</button>
              </li>
              <li>
                <button onClick={() => onNavigate("portfolio")} className={linkClass}>Portfolio</button>
              </li>
              <li>

              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Idea Spark. All rights reserved.</p>
          <p className="max-w-md sm:text-right">
            Early-stage investments carry a high risk, including the loss of your entire investment.
          </p>
        </div>
      </div>
    </footer>
  );
}