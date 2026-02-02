import { useMemo, useState } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import TrainingForm from "./trainingForm";
import TrainingDetails from "./trainingDetails";
import TrainingTable from "./trainingTable";

export default function TrainingPage({
  trainings = [],
  addTraining = () => {},
  assignPeople = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const totalEnrolled = trainings.reduce(
      (sum, t) => sum + (t.participants?.length || 0),
      0
    );

    return {
      activePrograms: trainings.length,
      totalEnrolled,
      certificatesIssued: Math.floor(totalEnrolled * 0.5),
      completed: trainings.filter((t) => t.progress === 100).length,
    };
  }, [trainings]);

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Programs" value={stats.activePrograms} />
        <StatCard title="Total Enrolled" value={stats.totalEnrolled} />
        <StatCard
          title="Certificates Issued"
          value={stats.certificatesIssued}
        />
        <StatCard title="Completed" value={stats.completed} />
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Training Programs</h2>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">+ Add Program</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Training Program</DialogTitle>
                </DialogHeader>

                <TrainingForm
                  onSubmit={(data) => {
                    addTraining(data);
                    setOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <TrainingTable trainings={trainings} onSelect={setSelected} />
        </CardContent>
      </Card>

      {/* Details Panel */}
      <TrainingDetails training={selected} onAssign={assignPeople} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
