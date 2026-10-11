
import Logo from "../Logo";
import { YEAR } from "../../constants/roleMeta";

export default function BrandPanel({ meta }) {
  return (
    <div className="relative z-10 hidden min-h-screen flex-col justify-between p-10 text-white lg:flex xl:p-12">
      <Logo />

      <div
        key={meta.label}
        className="max-w-lg animate-fade-up motion-reduce:animate-none"
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
          THE IDEASPARK NETWORK
        </p>

        <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          Where ambitious ideas meet investment.
        </h1>

        <div className="mt-6 h-1 w-16 rounded-full bg-emerald-400" />

        <p className="mt-6 text-base leading-7 text-slate-200 xl:text-lg">
          {meta.tagline}
        </p>

        <p className="mt-8 border-l-2 border-emerald-400 pl-4 text-sm leading-6 text-slate-300">
          Empowering founders. Connecting investors. Building opportunities.
        </p>
      </div>

      <footer className="flex justify-between border-t border-white/20 pt-5 text-xs text-slate-300">
        <span>© {YEAR} IdeaSpark</span>
        <span>Connecting ideas with capital</span>
      </footer>
    </div>
  );
}
