const STATUS_CONFIG = {
  cancelled: {
    dot: "bg-red-400",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
  draft: {
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-gray-500 border-gray-200",
  },
  upcoming: {
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ongoing: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  finished: {
    dot: "bg-gray-400",
    pill: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export default function TrainingCard({ training, onSelect }) {
  const cfg =
    STATUS_CONFIG[training.status?.toLowerCase()] ?? STATUS_CONFIG.draft;

  return (
    <div
      onClick={() => onSelect(training)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {training.title}
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${cfg.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {training.status || "Draft"}
        </span>
      </div>
      {training.description && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {training.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 border-t border-gray-50">
        <span>{training.duration || "—"}</span>
        <span className="text-gray-200">·</span>
        <span>{training.participants?.length ?? 0} enrolled</span>
      </div>
    </div>
  );
}
