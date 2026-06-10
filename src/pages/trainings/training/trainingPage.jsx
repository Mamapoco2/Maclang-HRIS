import { useState, useEffect, useCallback, useContext } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconClipboardList,
  IconUsers,
  IconAward,
  IconCircleCheck,
  IconPlus,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

import TrainingForm from "./trainingForm";
import TrainingTable from "./trainingTable";
import ViewTrainingModal from "../training/viewtrainingModal";
import EditTrainingModal from "../training/edittrainingModal";
import DeleteConfirmModal from "../training/deletecomponent";
import TrainingService from "../../../services/trainingService";
import { AuthContext } from "@/context/authContext";
import { getEcho } from "../../../lib/echo";

// ── Fix: send dates as local datetime strings, not UTC ISO ──────────────────
function toLocalISO(date) {
  if (!date) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

const ADMIN_ROLES = [
  "superadmin",
  "super-admin",
  "admin",
  "director",
  "hr",
  "head",
  "supervisor",
];

function useIsEmployee() {
  const { user } = useContext(AuthContext);
  if (!user) return false;
  const roles = (user.roles ?? []).map((r) => r.toLowerCase());
  return !roles.some((r) => ADMIN_ROLES.includes(r));
}

function recomputeStats(trainings) {
  const totalEnrolled = trainings.reduce(
    (sum, t) => sum + (t.participants?.length ?? 0),
    0,
  );
  const certificatesIssued = trainings.reduce(
    (sum, t) =>
      sum + (t.participants?.filter((p) => p.certificateIssued).length ?? 0),
    0,
  );
  const completed = trainings.filter((t) => t.progress === 100).length;
  return {
    activePrograms: trainings.length,
    totalEnrolled,
    certificatesIssued,
    completed,
  };
}

const STAT_CARDS = [
  {
    key: "activePrograms",
    label: "Active Programs",
    sub: "total programs",
    icon: IconClipboardList,
    color: "text-blue-600 bg-blue-50",
  },
  {
    key: "totalEnrolled",
    label: "Total Enrolled",
    sub: "participants",
    icon: IconUsers,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "certificatesIssued",
    label: "Certificates Issued",
    sub: "this year",
    icon: IconAward,
    color: "text-amber-600 bg-amber-50",
  },
  {
    key: "completed",
    label: "Completed",
    sub: "finished programs",
    icon: IconCircleCheck,
    color: "text-rose-600 bg-rose-50",
  },
];

export default function TrainingPage() {
  const isEmployee = useIsEmployee();
  const { user, hasPermission } = useContext(AuthContext);

  const canView = hasPermission("trainings.view");
  const canManage = hasPermission("trainings.manage");

  const currentUserId = user?.id ?? null;
  const currentEmployeeId = user?.employee_id ?? null;

  const [trainings, setTrainings] = useState([]);
  const [stats, setStats] = useState({
    activePrograms: 0,
    totalEnrolled: 0,
    certificatesIssued: 0,
    completed: 0,
  });
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, summaryRes] = await Promise.all([
        TrainingService.getAll({ all: true }),
        TrainingService.getSummary(),
      ]);
      setTrainings(listRes.data.data || []);
      setStats(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch trainings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const patchEnrolled = useCallback(
    (training) => ({
      ...training,
      isEnrolled: currentEmployeeId
        ? (training.participants ?? []).some((p) => p.id === currentEmployeeId)
        : false,
    }),
    [currentEmployeeId],
  );

  useEffect(() => {
    const echo = getEcho();
    const notifChannel = echo.channel("notifications");
    const onNotificationCreated = (e) => {
      if (e.type !== "training" || !e.training) return;
      if (e.posted_by_user_id === currentUserId) return;
      const patched = patchEnrolled(e.training);
      setTrainings((prev) => {
        if (prev.some((t) => t.id === patched.id))
          return prev.map((t) =>
            t.id === patched.id ? { ...t, ...patched } : t,
          );
        const next = [patched, ...prev];
        setStats(recomputeStats(next));
        return next;
      });
    };
    notifChannel.listen(".notification.created", onNotificationCreated);

    const trainingChannel = echo.channel("trainings");
    const onParticipantUpdated = (e) => {
      if (!e.training) return;
      const patched = patchEnrolled(e.training);
      setTrainings((prev) => {
        const next = prev.map((t) =>
          t.id === patched.id ? { ...t, ...patched } : t,
        );
        setStats(recomputeStats(next));
        return next;
      });
      setSelected((prev) =>
        prev?.id === patched.id ? { ...prev, ...patched } : prev,
      );
    };
    const onDeleted = (e) => {
      if (!e.id) return;
      setTrainings((prev) => {
        const next = prev.filter((t) => t.id !== e.id);
        setStats(recomputeStats(next));
        return next;
      });
      setSelected((prev) => {
        if (prev?.id === e.id) {
          setViewModalOpen(false);
          setEditModalOpen(false);
          setDeleteModalOpen(false);
          return null;
        }
        return prev;
      });
    };
    trainingChannel.listen(".participant.updated", onParticipantUpdated);
    trainingChannel.listen(".training.deleted", onDeleted);
    return () => {
      notifChannel.stopListening(
        ".notification.created",
        onNotificationCreated,
      );
      trainingChannel.stopListening(
        ".participant.updated",
        onParticipantUpdated,
      );
      trainingChannel.stopListening(".training.deleted", onDeleted);
    };
  }, [currentUserId, patchEnrolled]);

  const handleJoin = async (training) => {
    try {
      setJoiningId(training.id);
      await TrainingService.join(training.id);
      toast.success(`Successfully joined "${training.title}"`);
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === training.id ? { ...t, isEnrolled: true } : t,
        ),
      );
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to join training.");
    } finally {
      setJoiningId(null);
    }
  };

  const handleAddTraining = async (data) => {
    try {
      const res = await TrainingService.create({
        title: data.title,
        description: data.description,
        department: data.department,
        instructor: data.instructor,
        category: data.category,
        event_address: data.eventAddress,
        training_mode: data.trainingMode,
        start_date: toLocalISO(data.startDate),
        end_date: toLocalISO(data.endDate),
        duration: data.duration,
        max_participants: data.maxParticipants ?? 0,
        status: "active",
        progress: 0,
      });
      setOpen(false);
      const newTraining = res.data.data;
      if (newTraining) {
        setTrainings((prev) => {
          if (prev.some((t) => t.id === newTraining.id)) return prev;
          const next = [newTraining, ...prev];
          setStats(recomputeStats(next));
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPeople = async (trainingId, employeeIds) => {
    try {
      await TrainingService.assignParticipants(trainingId, employeeIds);
    } catch (err) {
      console.error("Assign failed:", err);
      toast.error(
        err.response?.data?.message ?? "Failed to assign participants.",
      );
      throw err;
    }
  };

  const handleViewTraining = (t) => {
    setSelected(t);
    setViewModalOpen(true);
  };
  const handleEditTraining = (t) => {
    setSelected(t);
    setEditModalOpen(true);
  };
  const handleDeleteTraining = (t) => {
    setSelected(t);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    try {
      await TrainingService.update(updated.id, {
        title: updated.title,
        description: updated.description,
        department: updated.department,
        instructor: updated.instructor,
        category: updated.category,
        event_address: updated.eventAddress,
        training_mode: updated.trainingMode,
        start_date: toLocalISO(updated.startDate),
        end_date: toLocalISO(updated.endDate),
        duration: updated.duration,
        status: updated.status,
        progress: updated.progress,
        max_participants: updated.maxParticipants ?? 0,
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteTraining = async () => {
    try {
      await TrainingService.remove(selected.id);
      setDeleteModalOpen(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  // No permission to view
  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="p-4 bg-gray-100 rounded-2xl">
          <IconClipboardList size={32} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-400">
          You don't have permission to view training programs.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <IconClipboardList size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Training Management
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                {isEmployee
                  ? "Browse available training programs and join ones you're interested in."
                  : "Manage training programs, track progress, and issue certifications."}
              </p>
            </div>
          </div>

          {/* Add Program button */}
          {!isEmployee && canManage && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors">
                  <IconPlus size={15} /> Add Program
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-gray-100 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold text-gray-900">
                    Add Training Program
                  </DialogTitle>
                </DialogHeader>
                <TrainingForm onSubmit={handleAddTraining} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── KPI Cards ── */}
        {!isEmployee && canManage && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map(({ key, label, sub, icon: Icon, color }) => (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {label}
                  </p>
                  <span className={`p-1.5 rounded-lg ${color}`}>
                    <Icon size={16} />
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats[key]}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats[key] > 0 ? `+${stats[key]}` : "0"} {sub}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Training Programs Table card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Training Programs
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {trainings.length} program{trainings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <IconLoader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : (
            <TrainingTable
              trainings={trainings}
              onSelect={setSelected}
              onView={handleViewTraining}
              onEdit={!isEmployee && canManage ? handleEditTraining : undefined}
              onDelete={
                !isEmployee && canManage ? handleDeleteTraining : undefined
              }
              onAssign={
                !isEmployee && canManage ? handleAssignPeople : undefined
              }
              isEmployee={isEmployee}
              canManage={canManage}
              onJoin={handleJoin}
              joiningId={joiningId}
              currentEmployeeId={currentEmployeeId}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <ViewTrainingModal
        training={selected}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {!isEmployee && canManage && (
        <>
          <EditTrainingModal
            training={selected}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSave={handleSaveEdit}
          />
          {selected && (
            <DeleteConfirmModal
              open={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              onDelete={confirmDeleteTraining}
              training={selected}
            />
          )}
        </>
      )}
    </div>
  );
}
