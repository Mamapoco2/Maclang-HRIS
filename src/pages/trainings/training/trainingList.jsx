import React from "react";
import TrainingCard from "./trainingCard";

export default function TrainingList({ trainings, onSelect }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {trainings.map((training) => (
        <TrainingCard
          key={training.id}
          training={training}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
