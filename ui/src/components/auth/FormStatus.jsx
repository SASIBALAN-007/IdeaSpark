
export default function FormStatus({ status }) {
  if (!status.msg) return null;

  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm ${
        status.type === "error"
          ? "border border-rose-200 bg-rose-50 text-rose-700"
          : "border border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {status.msg}
    </div>
  );
}
