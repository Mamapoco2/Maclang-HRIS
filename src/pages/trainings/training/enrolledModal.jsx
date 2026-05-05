import { useState, useEffect, useRef } from "react";
import { IconUsers, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import api from "../../../api/api";
import { getEcho } from "../../../lib/echo";

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

  const canMarkAttendance =
    userRole === "HR" ||
    userRole === "superAdmin" ||
    userRole === "admin" ||
    userRole === "hr";

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

  // ── Resolve participant fields from multiple possible API shapes ───────────
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
        className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-hidden border border-gray-200"
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
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 ring-1 ring-teal-200">
              <IconUsers size={11} />
              {totalCount}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <IconX size={14} />
            </button>
          </div>
        </div>

        {/* Attendance summary bar — HR & admins only */}
        {canMarkAttendance && (
          <div className="flex items-center justify-between px-5 py-2 bg-teal-50 border-b border-teal-100">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-teal-700">
              <IconCheck size={11} />
              {attendedCount} of {totalCount} marked present
            </span>
            <span className="text-[10px] text-teal-600 opacity-70">
              {attendedPct}%
            </span>
          </div>
        )}

        {/* Participant list */}
        <div className="px-2 py-1 max-h-72 overflow-y-auto">
          {participants.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              No participants enrolled yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
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

                    {/* Name + employee number */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 truncate">
                        {name}
                      </p>
                      {employeeNumber && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {employeeNumber}
                        </p>
                      )}
                    </div>

                    {/* Department badge */}
                    {department && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        {department}
                      </span>
                    )}

                    {/* Attendance button — HR & admins only */}
                    {canMarkAttendance && (
                      <div className="flex-shrink-0 w-[90px] flex justify-end">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                            <IconCheck size={10} />
                            Present
                          </span>
                        ) : (
                          <button
                            onClick={() => markAttendance(p.id ?? i)}
                            disabled={isMarking}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-200 transition-colors disabled:opacity-50"
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
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarWithFallback({ src, initials, name }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

export default EnrolledParticipantsModal;
