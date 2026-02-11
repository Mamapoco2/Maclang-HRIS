import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  IconClipboardList,
  IconUsers,
  IconAward,
  IconCircleCheck,
  IconPlus,
} from "@tabler/icons-react";

import TrainingForm from "./trainingForm";
import TrainingTable from "./trainingTable";
import ViewTrainingModal from "../components/viewtrainingModal";
import EditTrainingModal from "../components/edittrainingModal";
import DeleteConfirmModal from "../components/deletecomponent";

export default function TrainingPage() {
  const [trainings, setTrainings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const totalEnrolled = trainings.reduce(
      (sum, t) => sum + (t.participants?.length || 0),
      0,
    );

    return {
      activePrograms: trainings.length,
      totalEnrolled,
      certificatesIssued: Math.floor(totalEnrolled * 0.5),
      completed: trainings.filter((t) => t.progress === 100).length,
    };
  }, [trainings]);

  // Add training
  const handleAddTraining = (data) => {
    setTrainings((prev) => [...prev, data]);
    setOpen(false);
  };

  // Assign people
  const handleAssignPeople = (trainingId, participants) => {
    setTrainings((prev) =>
      prev.map((t) => (t.id === trainingId ? { ...t, participants } : t)),
    );
  };

  // View/Edit/Delete handlers
  const handleViewTraining = (training) => {
    setSelected(training);
    setViewModalOpen(true);
  };

  const handleEditTraining = (training) => {
    setSelected(training);
    setEditModalOpen(true);
  };

  const handleDeleteTraining = (training) => {
    setSelected(training);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTraining = () => {
    setTrainings((prev) => prev.filter((t) => t.id !== selected.id));
    setDeleteModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Training Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage training programs, track employee progress, and issue
          certifications
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        {/* Active Programs */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Programs
            </CardTitle>
            <IconClipboardList size={24} className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.activePrograms}</p>
            <p className="text-xs text-blue-600 mt-1">
              {stats.activePrograms > 0
                ? `+${stats.activePrograms} total`
                : "0"}
            </p>
          </CardContent>
        </Card>

        {/* Total Enrolled */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Enrolled
            </CardTitle>
            <IconUsers size={24} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalEnrolled}</p>
            <p className="text-xs text-green-600 mt-1">
              +{stats.totalEnrolled} participants
            </p>
          </CardContent>
        </Card>

        {/* Certificates Issued */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Certificates Issued
            </CardTitle>
            <IconAward size={24} className="text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.certificatesIssued}</p>
            <p className="text-xs text-yellow-600 mt-1">
              +{stats.certificatesIssued} this year
            </p>
          </CardContent>
        </Card>

        {/* Completed Trainings */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completed Trainings
            </CardTitle>
            <IconCircleCheck size={24} className="text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.completed}</p>
            <p className="text-xs text-purple-600 mt-1">
              {stats.completed} finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Training Table */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Training Programs</h2>

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
          </div>

          <TrainingTable
            trainings={trainings}
            onSelect={setSelected}
            onView={handleViewTraining}
            onEdit={handleEditTraining}
            onDelete={handleDeleteTraining}
            onAssign={handleAssignPeople}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewTrainingModal
        training={selected}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      <EditTrainingModal
        training={selected}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={(updatedTraining) => {
          setTrainings((prev) =>
            prev.map((t) =>
              t.id === updatedTraining.id ? updatedTraining : t,
            ),
          );
        }}
      />

      {selected && (
        <DeleteConfirmModal
          open={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={confirmDeleteTraining}
          training={selected}
        />
      )}
    </div>
  );
}
