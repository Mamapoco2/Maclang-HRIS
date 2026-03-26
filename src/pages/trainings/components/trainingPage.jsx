import { useState, useEffect, useCallback, useContext } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import ViewTrainingModal from "../components/viewtrainingModal";
import EditTrainingModal from "../components/edittrainingModal";
import DeleteConfirmModal from "../components/deletecomponent";
import TrainingService from "../../../services/trainingService";
import { AuthContext } from "@/context/authContext";
import { getEcho } from "../../../lib/echo";

// ── Role helper ───────────────────────────────────────────────────────────────
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

// ── Stats recompute helper ────────────────────────────────────────────────────
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

export default function TrainingPage() {
  const isEmployee = useIsEmployee();

  const { user } = useContext(AuthContext);
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

  // ── Fetch ──────────────────────────────────────────────────────────────────
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

  // ── Patch isEnrolled ──────────────────────────────────────────────────────
  const patchEnrolled = useCallback(
    (training) => ({
      ...training,
      isEnrolled: currentEmployeeId
        ? (training.participants ?? []).some((p) => p.id === currentEmployeeId)
        : false,
    }),
    [currentEmployeeId],
  );

  // ── Reverb realtime ────────────────────────────────────────────────────────
  useEffect(() => {
    const echo = getEcho();

    const notifChannel = echo.channel("notifications");

    const onNotificationCreated = (e) => {
      if (e.type !== "training" || !e.training) return;
      if (e.posted_by_user_id === currentUserId) return;

      const patched = patchEnrolled(e.training);

      setTrainings((prev) => {
        if (prev.some((t) => t.id === patched.id)) {
          return prev.map((t) =>
            t.id === patched.id ? { ...t, ...patched } : t,
          );
        }
        const next = [patched, ...prev];
        setStats(recomputeStats(next));
        return next;
      });
    };

    notifChannel.listen(".notification.created", onNotificationCreated);

    const trainingChannel = echo.channel("trainings");

    const onParticipantUpdated = (e) => {
      const updated = e.training;
      if (!updated) return;

      const patched = patchEnrolled(updated);

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
      const deletedId = e.id;
      if (!deletedId) return;

      setTrainings((prev) => {
        const next = prev.filter((t) => t.id !== deletedId);
        setStats(recomputeStats(next));
        return next;
      });

      setSelected((prev) => {
        if (prev?.id === deletedId) {
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

  // ── Join ───────────────────────────────────────────────────────────────────
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

  // ── Add ────────────────────────────────────────────────────────────────────
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
        start_date: data.startDate,
        end_date: data.endDate,
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

  // ── Assign ─────────────────────────────────────────────────────────────────
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

  // ── View / Edit / Delete ───────────────────────────────────────────────────
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
        start_date: updated.startDate,
        end_date: updated.endDate,
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Training Management</h1>
        <p className="text-sm text-muted-foreground">
          {isEmployee
            ? "Browse available training programs and join ones you're interested in."
            : "Manage training programs, track employee progress, and issue certifications."}
        </p>
      </div>

      {/* KPI Cards — admin/HR only */}
      {!isEmployee && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          {[
            {
              label: "Active Programs",
              value: stats.activePrograms,
              sub: `+${stats.activePrograms} total`,
              icon: <IconClipboardList size={24} />,
              color: "text-blue-600",
            },
            {
              label: "Total Enrolled",
              value: stats.totalEnrolled,
              sub: `+${stats.totalEnrolled} participants`,
              icon: <IconUsers size={24} />,
              color: "text-green-600",
            },
            {
              label: "Certificates Issued",
              value: stats.certificatesIssued,
              sub: `+${stats.certificatesIssued} this year`,
              icon: <IconAward size={24} />,
              color: "text-yellow-600",
            },
            {
              label: "Completed Trainings",
              value: stats.completed,
              sub: `${stats.completed} finished`,
              icon: <IconCircleCheck size={24} />,
              color: "text-purple-600",
            },
          ].map(({ label, value, sub, icon, color }) => (
            <Card key={label} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <span className={color}>{icon}</span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{value}</p>
                <p className={`text-xs mt-1 ${color}`}>{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Training Programs</h2>
            {!isEmployee && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <IconPlus size={16} stroke={2} color="#fff" />
                    Add Program
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Training Program</DialogTitle>
                  </DialogHeader>
                  <TrainingForm onSubmit={handleAddTraining} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <IconLoader2
                size={28}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : (
            <TrainingTable
              trainings={trainings}
              onSelect={setSelected}
              onView={handleViewTraining}
              onEdit={isEmployee ? undefined : handleEditTraining}
              onDelete={isEmployee ? undefined : handleDeleteTraining}
              onAssign={isEmployee ? undefined : handleAssignPeople}
              isEmployee={isEmployee}
              onJoin={handleJoin}
              joiningId={joiningId}
              currentEmployeeId={currentEmployeeId}
            />
          )}
        </CardContent>
      </Card>

      <ViewTrainingModal
        training={selected}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {!isEmployee && (
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
