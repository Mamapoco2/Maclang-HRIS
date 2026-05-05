import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ViewTrainingModal({ training, open, onOpenChange }) {
  if (!training) return null;

  const STATUS_CONFIG = {
    cancelled: {
      dot: "bg-red-400",
      pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
    },
    draft: {
      dot: "bg-gray-300",
      pill: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    },
    upcoming: {
      dot: "bg-blue-400",
      pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    },
    ongoing: {
      dot: "bg-teal-500",
      pill: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    },
    finished: {
      dot: "bg-gray-400",
      pill: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    },
  };

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
      : "text-teal-600";

  const Row = ({ label, children }) => (
    <div className="flex items-start gap-4 py-2.5 border-b border-gray-100 last:border-none">
      <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-32 flex-shrink-0 mt-0.5">
        {label}
      </dt>
      <dd className="text-[13px] text-gray-800 font-medium flex-1">
        {children || <span className="text-gray-300 font-normal">—</span>}
      </dd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 rounded-xl overflow-hidden border-gray-200 gap-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Training Details
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Complete information about this training program.
          </p>
        </div>

        {/* Title strip */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            {training.title}
          </h3>
          {training.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {training.description}
            </p>
          )}
          <div className="mt-2 flex gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.pill}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {training.status || "Draft"}
            </span>
            {training.trainingMode && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  training.trainingMode === "online"
                    ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
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
        <div className="px-6 py-2">
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
                  <span className="ml-1.5 text-[11px] uppercase tracking-wide">
                    · Full
                  </span>
                )}
              </span>
            ) : (
              enrolledCount
            )}
          </Row>
        </div>
      </DialogContent>
    </Dialog>
  );
}
