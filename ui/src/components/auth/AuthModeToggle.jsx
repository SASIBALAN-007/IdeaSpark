
export default function AuthModeToggle({
  mode,
  onSwitchMode,
}) {
  return (
    <div className="mt-4 text-sm">
      {mode === "signin" ? (
        <p className="text-slate-500">
          New here?{" "}
          <button
            type="button"
            className="font-semibold text-brand-600 hover:underline"
            onClick={() => onSwitchMode("signup")}
          >
            Create an account
          </button>
        </p>
      ) : (
        <p className="text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            className="font-semibold text-brand-600 hover:underline"
            onClick={() => onSwitchMode("signin")}
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
}
