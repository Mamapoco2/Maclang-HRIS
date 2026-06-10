import TrainingCard from "./trainingCard";

export default function TrainingList({ trainings, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
