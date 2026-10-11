
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to from-brand-500 to-brand-700 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
        >
          <path d="M13 2 3 14h7l-1 8 11-13h-7l0-7z" />
        </svg>
      </div>

      <span className="text-lg font-bold tracking-tight text-white">
        <p className="text-white font-bold">IdeaSpark</p>
      </span>
    </div>
  );
}
