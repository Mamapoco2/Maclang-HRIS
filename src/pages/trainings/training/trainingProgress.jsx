import React from "react";
import { Progress } from "@/components/ui/progress";

export default function TrainingProgress({ value }) {
  return (
    <div className="space-y-1">
      <Progress value={value} />
      <p className="text-xs text-right">{value}% Completed</p>
    </div>
  );
}
