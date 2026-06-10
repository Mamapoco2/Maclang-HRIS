export default function TrainingProgress({ value }) {
  const color =
    value === 100
      ? "bg-emerald-500"
      : value > 50
        ? "bg-blue-500"
        : value > 0
          ? "bg-amber-500"
          : "bg-gray-200";

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{value}% Completed</p>
    </div>
  );
}
