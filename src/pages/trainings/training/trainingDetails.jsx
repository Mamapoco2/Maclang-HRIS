import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import TrainingProgress from "./trainingProgress";
import TrainingAssignPeople from "./trainingPeopleAssign";

export default function TrainingDetails({ training, onAssign }) {
  if (!training) return;

  return (
    <Card className="rounded-2xl shadow">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">{training.title}</h2>
        <p className="text-sm text-muted-foreground">{training.description}</p>
        <TrainingProgress value={training.progress || 0} />
        <TrainingAssignPeople training={training} onAssign={onAssign} />
      </CardContent>
    </Card>
  );
}
