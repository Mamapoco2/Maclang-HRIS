// src/pages/trainings/pages/trainingTable.jsx
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import TrainingAssignPeople from "../components/trainingPeopleAssign";
import EnrolledParticipantsModal from "../components/enrolledModal";

// ── Live clock hook — ticks every 60 s so status badges re-evaluate ──────────
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  cancelled: {
    label: "Cancelled",
    dot: "bg-[#E24B4A]",
    badge: "bg-[#FCEBEB] text-[#791F1F] dark:bg-[#791F1F] dark:text-[#F7C1C1]",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-[#378ADD]",
    badge: "bg-[#E6F1FB] text-[#0C447C] dark:bg-[#0C447C] dark:text-[#B5D4F4]",
  },
  ongoing: {
    label: "Ongoing",
    dot: "bg-[#639922]",
    badge: "bg-[#EAF3DE] text-[#27500A] dark:bg-[#27500A] dark:text-[#C0DD97]",
  },
  finished: {
    label: "Finished",
    dot: "bg-[#888780]",
    badge: "bg-[#F1EFE8] text-[#444441] dark:bg-[#444441] dark:text-[#D3D1C7]",
  },
  draft: {
    label: "Draft",
    dot: "bg-[#B4B2A9]",
    badge: "bg-[#F1EFE8] text-[#5F5E5A] dark:bg-[#444441] dark:text-[#B4B2A9]",
  },
};

const MODE_STYLES = {
  online: "bg-[#EEEDFE] text-[#3C3489] dark:bg-[#3C3489] dark:text-[#CECBF6]",
  "face-to-face":
    "bg-[#FAEEDA] text-[#633806] dark:bg-[#633806] dark:text-[#FAC775]",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function resolveStatus(training, now = new Date()) {
  if (training.status === "cancelled") return STATUS_STYLES.cancelled;
  if (!training.startDate || !training.endDate) return STATUS_STYLES.draft;
  const start = new Date(training.startDate);
  const end = new Date(training.endDate);
  if (now < start) return STATUS_STYLES.upcoming;
  if (now >= start && now <= end) return STATUS_STYLES.ongoing;
  if (now > end) return STATUS_STYLES.finished;
  return STATUS_STYLES.draft;
}

function isJoinHidden(training, now) {
  const s = resolveStatus(training, now);
  return s === STATUS_STYLES.finished || s === STATUS_STYLES.cancelled;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ training, now }) {
  const s = resolveStatus(training, now);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

/**
 * Shows "count" when no max is set, or "count/max" when max > 0.
 * Turns amber when ≥ 80% full, red when completely full.
 */
function EnrolledBadge({ count, max, isAdmin, onClick }) {
  const hasMax = max > 0;
  const isFull = hasMax && count >= max;
  const isNearFull = hasMax && !isFull && count / max >= 0.8;

  const colorClass = isFull
    ? "bg-[#FCEBEB] text-[#791F1F] dark:bg-[#791F1F] dark:text-[#F7C1C1]"
    : isNearFull
      ? "bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F] dark:text-[#FDE68A]"
      : "bg-[#E0F4F4] text-[#0E6B6B] dark:bg-[#0E3D3D] dark:text-[#7DD6D6]";

  const clickable = isAdmin && count > 0;

  return (
    <span
      onClick={clickable ? onClick : undefined}
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${colorClass} ${
        clickable ? "cursor-pointer transition-colors" : ""
      }`}
    >
      <IconUsers size={11} className="flex-shrink-0" />
      {hasMax ? (
        <>
          {count}
          <span className="opacity-50">/</span>
          {max}
        </>
      ) : (
        count
      )}
    </span>
  );
}

function ActionBtn({ title, onClick, className, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-md border-0 bg-transparent cursor-pointer text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      {children}
    </button>
  );
}

// ── Join Confirm Modal ────────────────────────────────────────────────────────
function JoinConfirmModal({ training, open, onClose, onConfirm, joining }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Join Training Program
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            You are about to enroll in this training program.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {training?.title}
            </p>
            {training?.department && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Department: {training.department}
              </p>
            )}
            {training?.instructor && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Instructor: {training.instructor}
              </p>
            )}
            {training?.startDate && training?.endDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(training.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                —{" "}
                {new Date(training.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
            {training?.eventAddress && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Location: {training.eventAddress}
              </p>
            )}
            {/* Slot availability inside the confirm modal */}
            {training?.maxParticipants > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Slots available:{" "}
                <span
                  className={
                    (training.participants?.length ?? 0) >=
                    training.maxParticipants
                      ? "text-red-500 font-medium"
                      : "text-green-600 font-medium"
                  }
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to join this training?
          </p>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={joining}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={joining}>
            {joining ? (
              <>
                <IconLoader2 size={14} className="animate-spin mr-1" />
                Joining...
              </>
            ) : (
              <>
                <IconUserPlus size={14} className="mr-1" />
                Confirm Join
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  { label: "Program", width: "min-w-[160px] w-48" },
  { label: "Department", width: "min-w-[140px] w-44" },
  { label: "Category", width: "min-w-[100px] w-32" },
  { label: "Location", width: "min-w-[120px] w-36" },
  { label: "Time & Date", width: "min-w-[140px] w-40" },
  { label: "Mode", width: "min-w-[100px] w-28" },
  { label: "Duration", width: "min-w-[80px]  w-24" },
  { label: "Enrolled", width: "min-w-[90px]  w-28" },
  { label: "Status", width: "min-w-[100px] w-28" },
  { label: "Actions", width: "min-w-[110px] w-28" },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function TrainingTable({
  trainings = [],
  onSelect = () => {},
  onView = () => {},
  onEdit,
  onDelete,
  onAssign,
  isEmployee = false,
  onJoin = () => {},
  joiningId = null,
  // currentEmployeeId,
}) {
  const now = useNow();

  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [enrolledTraining, setEnrolledTraining] = useState(null);
  const [joinTarget, setJoinTarget] = useState(null);
  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);

  const handleAssignClick = (training) => {
    setSelectedTraining(training);
    setAssignModalOpen(true);
  };

  const handleEnrolledClick = (e, training) => {
    e.stopPropagation();
    setEnrolledTraining(training);
  };

  const handleJoinClick = (e, training) => {
    e.stopPropagation();
    setJoinTarget(training);
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

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl dark:border-gray-700">
        <table className="w-full text-sm border-collapse">
          {/* ── Header ── */}
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              {COLUMNS.map(({ label, width }) => (
                <th
                  key={label}
                  className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide text-center ${width}`}
                >
                  {label === "Enrolled" ? (
                    <span className="flex items-center justify-center gap-1">
                      <IconUsers size={12} />
                      Enrolled
                    </span>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {trainings.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="text-center py-12 text-sm text-gray-400 dark:text-gray-500"
                >
                  No trainings added yet
                </td>
              </tr>
            )}

            {trainings.map((t) => {
              const enrolledCount = t.participants?.length ?? 0;
              const maxSlots = t.maxParticipants ?? 0;
              const isJoining = joiningId === t.id;
              const isEnrolled = t.isEnrolled === true;
              const hideJoin = isJoinHidden(t, now);
              // Hide join button when training is full (backend enforces this too)
              const isFull = maxSlots > 0 && enrolledCount >= maxSlots;

              return (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                  onClick={() => onSelect(t)}
                >
                  {/* Program */}
                  <td className="px-3 py-3 text-center">
                    <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 break-words text-[13px]">
                      {t.title}
                    </p>
                  </td>

                  {/* Department */}
                  <td className="px-3 py-3 text-center">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 break-words text-[13px]">
                      {t.department || (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3 text-center text-[13px] text-gray-600 dark:text-gray-400">
                    {t.category || (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-3 py-3 text-center">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 break-words text-[13px]">
                      {t.eventAddress || (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </p>
                  </td>

                  {/* Time & Date */}
                  <td className="px-3 py-3 text-center">
                    {t.startDate && t.endDate ? (
                      <>
                        <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
                          {new Date(t.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap mt-0.5">
                          {new Date(t.startDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {new Date(t.endDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Mode */}
                  <td className="px-3 py-3 text-center">
                    {t.trainingMode ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                          MODE_STYLES[t.trainingMode] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.trainingMode === "face-to-face"
                          ? "Face to face"
                          : "Online"}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-3 text-center text-[13px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {t.duration || (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Enrolled — "count" or "count/max" with color signals */}
                  <td
                    className="px-3 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center">
                      <EnrolledBadge
                        count={enrolledCount}
                        max={maxSlots}
                        isAdmin={!isEmployee}
                        onClick={(e) => handleEnrolledClick(e, t)}
                      />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center">
                      <StatusBadge training={t} now={now} />
                    </div>
                  </td>

                  {/* Actions */}
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <ActionBtn
                        title="View"
                        onClick={() => onView(t)}
                        className="hover:text-[#185FA5]"
                      >
                        <IconEye size={15} />
                      </ActionBtn>

                      {isEmployee ? (
                        isEnrolled ? (
                          // Already enrolled
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800">
                            <IconCircleCheck size={13} />
                            Enrolled
                          </span>
                        ) : hideJoin ? null : isFull ? (
                          // Training is full
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border border-gray-200 dark:border-gray-700">
                            <IconUsers size={13} />
                            Full
                          </span>
                        ) : (
                          // Available to join
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isJoining}
                            onClick={(e) => handleJoinClick(e, t)}
                            className="h-7 px-2.5 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950"
                          >
                            {isJoining ? (
                              <IconLoader2 size={13} className="animate-spin" />
                            ) : (
                              <IconUserPlus size={13} />
                            )}
                            {isJoining ? "Joining…" : "Join"}
                          </Button>
                        )
                      ) : (
                        <>
                          <ActionBtn
                            title="Assign participants"
                            onClick={() => handleAssignClick(t)}
                            className="hover:text-[#534AB7]"
                          >
                            <IconUserPlus size={15} />
                          </ActionBtn>
                          <ActionBtn
                            title="Edit"
                            onClick={() => onEdit?.(t)}
                            className="hover:text-[#3B6D11]"
                          >
                            <IconEdit size={15} />
                          </ActionBtn>
                          <ActionBtn
                            title="Delete"
                            onClick={() => onDelete?.(t)}
                            className="!text-[#E24B4A] hover:text-[#A32D2D] hover:!bg-red-50"
                          >
                            <IconTrash size={15} />
                          </ActionBtn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Join confirmation modal */}
      <JoinConfirmModal
        training={joinTarget}
        open={joinConfirmOpen}
        onClose={handleJoinCancel}
        onConfirm={handleJoinConfirm}
        joining={joiningId === joinTarget?.id}
      />

      {selectedTraining && !isEmployee && (
        <TrainingAssignPeople
          training={selectedTraining}
          open={isAssignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={onAssign}
          // currentEmployeeId={currentEmployeeId}
        />
      )}

      {enrolledTraining && !isEmployee && (
        <EnrolledParticipantsModal
          training={enrolledTraining}
          onClose={() => setEnrolledTraining(null)}
        />
      )}
    </>
  );
}
