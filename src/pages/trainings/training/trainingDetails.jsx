import TrainingProgress from "./trainingProgress";
import TrainingAssignPeople from "./trainingPeopleAssign";

export default function TrainingDetails({ training, onAssign }) {
  if (!training) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">{training.title}</h2>
        {training.description && (
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            {training.description}
          </p>
        )}
      </div>
      <TrainingProgress value={training.progress || 0} />
      <TrainingAssignPeople training={training} onAssign={onAssign} />
    </div>
  );
}
