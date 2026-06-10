import { useState, useEffect, useRef } from "react";
import { IconUsers, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import api from "../../../api/api";
import { getEcho } from "../../../lib/echo";

function AvatarWithFallback({ src, initials, name }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
      {initials}
    </div>
  );
}

export function EnrolledParticipantsModal({
  training: initialTraining,
  onClose,
  userRole = "employee",
}) {
  const [training, setTraining] = useState(initialTraining);
  const [markingId, setMarkingId] = useState(null);
  const listenerRef = useRef(null);

  useEffect(() => {
    setTraining(initialTraining);
  }, [initialTraining]);

  useEffect(() => {
    if (!training?.id) return;
    const echo = getEcho();
    const channel = echo.channel("trainings");
    const handler = (e) => {
      if (e.training?.id !== training.id) return;
      setTraining((prev) => ({ ...prev, ...e.training }));
    };
    channel.listen(".participant.updated", handler);
    listenerRef.current = handler;
    return () => {
      channel.stopListening(".participant.updated", listenerRef.current);
    };
  }, [training?.id]);

  const participants = training?.participants ?? [];
  const canMarkAttendance = ["HR", "superAdmin", "admin", "hr"].includes(
    userRole,
  );

  const markAttendance = async (participantId) => {
    if (markingId) return;
    try {
      setMarkingId(participantId);
      await api.patch(
        `/trainings/${training.id}/participants/${participantId}/attend`,
      );
      setTraining((prev) => ({
        ...prev,
        participants: (prev.participants ?? []).map((p) =>
          p.id === participantId
            ? { ...p, attendedAt: new Date().toISOString() }
            : p,
        ),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to mark attendance.");
    } finally {
      setMarkingId(null);
    }
  };

  const attendedCount = participants.filter((p) => p.attendedAt).length;
  const totalCount = participants.length;
  const attendedPct =
    totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  const resolveName = (p) =>
    p.name ||
    (p.first_name || p.last_name
      ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()
      : null) ||
    p.employee?.name ||
    (p.employee?.first_name || p.employee?.last_name
      ? `${p.employee?.first_name ?? ""} ${p.employee?.last_name ?? ""}`.trim()
      : null) ||
    p.full_name ||
    null;
  const resolveEmployeeNumber = (p) =>
    p.employeeNumber ||
    p.employee_number ||
    p.employee?.employee_number ||
    p.employee?.employeeNumber ||
    null;
  const resolveDepartment = (p) =>
    p.department ||
    p.department_name ||
    p.employee?.department ||
    p.employee?.department_name ||
    null;
  const resolveAvatar = (p) =>
    p.avatar_url ||
    p.avatar ||
    p.employee?.avatar_url ||
    p.employee?.avatar ||
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-900">
              Enrolled Participants
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {training?.title}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <IconUsers size={11} /> {totalCount}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <IconX size={14} />
            </button>
          </div>
        </div>

        {/* Attendance summary */}
        {canMarkAttendance && (
          <div className="flex items-center justify-between px-5 py-2 bg-emerald-50 border-b border-emerald-100">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <IconCheck size={11} /> {attendedCount} of {totalCount} marked
              present
            </span>
            <span className="text-[10px] text-emerald-600 opacity-70">
              {attendedPct}%
            </span>
          </div>
        )}

        {/* List */}
        <div className="px-2 py-1 max-h-72 overflow-y-auto">
          {participants.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              No participants enrolled yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {participants.map((p, i) => {
                const name = resolveName(p) || `Participant ${i + 1}`;
                const employeeNumber = resolveEmployeeNumber(p);
                const department = resolveDepartment(p);
                const avatarSrc = resolveAvatar(p);
                const initials = name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const isPresent = !!p.attendedAt;
                const isMarking = markingId === p.id;

                return (
                  <li
                    key={p.id ?? i}
                    className="flex items-center gap-3 py-2.5 px-3"
                  >
                    <AvatarWithFallback
                      src={avatarSrc}
                      initials={initials}
                      name={name}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {name}
                      </p>
                      {employeeNumber && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {employeeNumber}
                        </p>
                      )}
                    </div>
                    {department && (
                      <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        {department}
                      </span>
                    )}
                    {canMarkAttendance && (
                      <div className="shrink-0 w-[90px] flex justify-end">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <IconCheck size={10} /> Present
                          </span>
                        ) : (
                          <button
                            onClick={() => markAttendance(p.id ?? i)}
                            disabled={isMarking}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors disabled:opacity-50"
                          >
                            {isMarking ? (
                              <IconLoader2 size={10} className="animate-spin" />
                            ) : (
                              <IconCheck size={10} />
                            )}
                            {isMarking ? "Saving…" : "Attendance"}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {canMarkAttendance
              ? attendedCount === totalCount && totalCount > 0
                ? "All participants marked present"
                : "Click attendance to mark as present"
              : "Managed by HR or admin"}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnrolledParticipantsModal;
