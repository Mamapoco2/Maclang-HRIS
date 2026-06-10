import { useState, useEffect } from "react";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconLoader2,
  IconCircleCheck,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import TrainingAssignPeople from "./trainingPeopleAssign";
import EnrolledParticipantsModal from "./enrolledModal";

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const STATUS_STYLES = {
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ongoing: {
    label: "Ongoing",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  finished: {
    label: "Finished",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
  },
  draft: {
    label: "Draft",
    dot: "bg-gray-300",
    badge: "bg-gray-50 text-gray-500 border-gray-200",
  },
};

const MODE_STYLES = {
  online: "bg-purple-50 text-purple-700 border-purple-200",
  "face-to-face": "bg-amber-50 text-amber-700 border-amber-200",
};

function resolveStatus(training, now = new Date()) {
  if (training.status === "cancelled") return STATUS_STYLES.cancelled;
  if (!training.startDate || !training.endDate) return STATUS_STYLES.draft;
  const start = new Date(training.startDate),
    end = new Date(training.endDate);
  if (now < start) return STATUS_STYLES.upcoming;
  if (now >= start && now <= end) return STATUS_STYLES.ongoing;
  if (now > end) return STATUS_STYLES.finished;
  return STATUS_STYLES.draft;
}

function isJoinHidden(training, now) {
  const s = resolveStatus(training, now);
  return s === STATUS_STYLES.finished || s === STATUS_STYLES.cancelled;
}

function StatusBadge({ training, now }) {
  const s = resolveStatus(training, now);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function EnrolledBadge({ count, max, isAdmin, onClick }) {
  const hasMax = max > 0,
    isFull = hasMax && count >= max;
  const isNearFull = hasMax && !isFull && count / max >= 0.8;
  const colorClass = isFull
    ? "bg-red-50 text-red-700 border-red-200"
    : isNearFull
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  const clickable = isAdmin && count > 0;
  return (
    <span
      onClick={
        clickable
          ? (e) => {
              e.stopPropagation();
              onClick(e);
            }
          : undefined
      }
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${colorClass} ${clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
    >
      <IconUsers size={11} className="shrink-0" />
      {hasMax ? (
        <>
          {count}
          <span className="opacity-40">/</span>
          {max}
        </>
      ) : (
        count
      )}
    </span>
  );
}

function JoinConfirmModal({ training, open, onClose, onConfirm, joining }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Join Training Program
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400 mt-0.5">
            You are about to enroll in this training program.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-1.5">
            <p className="text-sm font-semibold text-gray-900">
              {training?.title}
            </p>
            {training?.department && (
              <p className="text-xs text-gray-400">
                Department: {training.department}
              </p>
            )}
            {training?.instructor && (
              <p className="text-xs text-gray-400">
                Instructor: {training.instructor}
              </p>
            )}
            {training?.startDate && training?.endDate && (
              <p className="text-xs text-gray-400">
                {new Date(training.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" — "}
                {new Date(training.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
            {training?.eventAddress && (
              <p className="text-xs text-gray-400">
                Location: {training.eventAddress}
              </p>
            )}
            {training?.maxParticipants > 0 && (
              <p className="text-xs text-gray-400">
                Slots available:{" "}
                <span
                  className={`font-medium ${(training.participants?.length ?? 0) >= training.maxParticipants ? "text-red-500" : "text-emerald-600"}`}
                >
                  {Math.max(
                    0,
                    training.maxParticipants -
                      (training.participants?.length ?? 0),
                  )}{" "}
                  of {training.maxParticipants}
                </span>
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to join this training?
          </p>

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <button
              onClick={onClose}
              disabled={joining}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={joining}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {joining ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" /> Joining…
                </>
              ) : (
                <>
                  <IconUserPlus size={14} /> Confirm Join
                </>
              )}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const COLUMNS = [
  { label: "Program", width: "min-w-[160px]" },
  { label: "Department", width: "min-w-[120px]" },
  { label: "Category", width: "min-w-[100px]" },
  { label: "Location", width: "min-w-[120px]" },
  { label: "Time & Date", width: "min-w-[160px]" },
  { label: "Mode", width: "min-w-[100px]" },
  { label: "Duration", width: "min-w-[80px]" },
  { label: "Enrolled", width: "min-w-[90px]" },
  { label: "Status", width: "min-w-[100px]" },
  { label: "Actions", width: "min-w-[120px]" },
];

export default function TrainingTable({
  trainings = [],
  onSelect = () => {},
  onView = () => {},
  onEdit,
  onDelete,
  onAssign,
  isEmployee = false,
  canManage = false,
  onJoin = () => {},
  joiningId = null,
  userRole = "HR",
}) {
  const now = useNow();
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [enrolledTraining, setEnrolledTraining] = useState(null);
  const [joinTarget, setJoinTarget] = useState(null);
  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);

  const handleAssignClick = (t) => {
    setSelectedTraining(t);
    setAssignModalOpen(true);
  };
  const handleEnrolledClick = (e, t) => {
    e.stopPropagation();
    setEnrolledTraining(t);
  };
  const handleJoinClick = (e, t) => {
    e.stopPropagation();
    setJoinTarget(t);
    setJoinConfirmOpen(true);
  };
  const handleJoinConfirm = async () => {
    await onJoin(joinTarget);
    setJoinConfirmOpen(false);
    setJoinTarget(null);
  };
  const handleJoinCancel = () => {
    setJoinConfirmOpen(false);
    setJoinTarget(null);
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {COLUMNS.map(({ label, width }) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide ${width}`}
                >
                  {label === "Enrolled" ? (
                    <span className="flex items-center gap-1">
                      <IconUsers size={11} /> Enrolled
                    </span>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {trainings.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-gray-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p className="text-sm text-gray-400">
                      No training programs yet
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              trainings.map((t) => {
                const enrolledCount = t.participants?.length ?? 0;
                const maxSlots = t.maxParticipants ?? 0;
                const isJoining = joiningId === t.id;
                const isEnrolled = t.isEnrolled === true;
                const hideJoin = isJoinHidden(t, now);
                const isFull = maxSlots > 0 && enrolledCount >= maxSlots;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onSelect(t)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">
                        {t.title}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {t.department || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {t.category || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 line-clamp-2">
                      {t.eventAddress || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {t.startDate && t.endDate ? (
                        <>
                          <p className="text-xs font-medium text-gray-800">
                            {new Date(t.startDate).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">
                            {formatTime(t.startDate)} – {formatTime(t.endDate)}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {t.trainingMode ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${MODE_STYLES[t.trainingMode] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
                        >
                          {t.trainingMode === "face-to-face"
                            ? "Face to face"
                            : "Online"}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {t.duration || <span className="text-gray-300">—</span>}
                    </td>

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EnrolledBadge
                        count={enrolledCount}
                        max={maxSlots}
                        isAdmin={!isEmployee && canManage}
                        onClick={(e) => handleEnrolledClick(e, t)}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge training={t} now={now} />
                    </td>

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          title="View"
                          onClick={() => onView(t)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <IconEye size={15} />
                        </button>

                        {isEmployee ? (
                          isEnrolled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <IconCircleCheck size={12} /> Enrolled
                            </span>
                          ) : hideJoin ? null : isFull ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-100 text-gray-400 border border-gray-200">
                              <IconUsers size={12} /> Full
                            </span>
                          ) : (
                            <button
                              disabled={isJoining}
                              onClick={(e) => handleJoinClick(e, t)}
                              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {isJoining ? (
                                <IconLoader2
                                  size={12}
                                  className="animate-spin"
                                />
                              ) : (
                                <IconUserPlus size={12} />
                              )}
                              {isJoining ? "Joining…" : "Join"}
                            </button>
                          )
                        ) : canManage ? (
                          <>
                            <button
                              title="Assign participants"
                              onClick={() => handleAssignClick(t)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                            >
                              <IconUserPlus size={15} />
                            </button>
                            <button
                              title="Edit"
                              onClick={() => onEdit?.(t)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            >
                              <IconEdit size={15} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => onDelete?.(t)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <IconTrash size={15} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <JoinConfirmModal
        training={joinTarget}
        open={joinConfirmOpen}
        onClose={handleJoinCancel}
        onConfirm={handleJoinConfirm}
        joining={joiningId === joinTarget?.id}
      />

      {selectedTraining && !isEmployee && canManage && (
        <TrainingAssignPeople
          training={selectedTraining}
          open={isAssignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={onAssign}
        />
      )}

      {enrolledTraining && !isEmployee && canManage && (
        <EnrolledParticipantsModal
          training={enrolledTraining}
          onClose={() => setEnrolledTraining(null)}
          userRole={userRole}
        />
      )}
    </>
  );
}
