import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function Row({ label, children }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-none">
      <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">
        {label}
      </dt>
      <dd className="text-xs font-medium text-gray-800 flex-1">
        {children || <span className="text-gray-300 font-normal">—</span>}
      </dd>
    </div>
  );
}

export default function ViewTrainingModal({ training, open, onOpenChange }) {
  if (!training) return null;

  const cfg =
    STATUS_CONFIG[training.status?.toLowerCase()] ?? STATUS_CONFIG.draft;

  const enrolledCount = training.participants?.length ?? 0;
  const maxSlots = training.maxParticipants ?? 0;
  const hasMax = maxSlots > 0;
  const isFull = hasMax && enrolledCount >= maxSlots;
  const isNearFull = hasMax && !isFull && enrolledCount / maxSlots >= 0.8;
  const slotColor = isFull
    ? "text-red-500"
    : isNearFull
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Training Details
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Complete information about this training program.
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-5">
          {/* Title strip */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {training.title}
            </h3>
            {training.description && (
              <p className="text-xs text-gray-400 leading-relaxed">
                {training.description}
              </p>
            )}
            <div className="flex gap-1.5 flex-wrap pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.pill}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {training.status || "Draft"}
              </span>
              {training.trainingMode && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    training.trainingMode === "online"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {training.trainingMode === "face-to-face"
                    ? "Face to Face"
                    : "Online"}
                </span>
              )}
            </div>
          </div>

          {/* Detail rows */}
          <div>
            <Row label="Department">{training.department}</Row>
            <Row label="Category">{training.category}</Row>
            <Row label="Instructor">{training.instructor}</Row>
            <Row label="Location">{training.eventAddress}</Row>
            <Row label="Duration">{training.duration}</Row>
            <Row label="Start">
              {training.startDate
                ? new Date(training.startDate).toLocaleString()
                : null}
            </Row>
            <Row label="End">
              {training.endDate
                ? new Date(training.endDate).toLocaleString()
                : null}
            </Row>
            <Row label="Enrolled">
              {hasMax ? (
                <span className={`font-semibold ${slotColor}`}>
                  {enrolledCount} / {maxSlots}
                  {isFull && (
                    <span className="ml-1.5 text-[10px] uppercase tracking-wide">
                      · Full
                    </span>
                  )}
                </span>
              ) : (
                enrolledCount
              )}
            </Row>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
