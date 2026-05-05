import { cn } from "@/lib/utils";

const SCALE = [
  {
    value: 1,
    label: "Beginner",
    desc: "No or minimal experience",
    color: "bg-red-400 border-red-500 text-white",
  },
  {
    value: 2,
    label: "Basic",
    desc: "Limited, requires guidance",
    color: "bg-orange-400 border-orange-500 text-white",
  },
  {
    value: 3,
    label: "Developing",
    desc: "Moderate, needs improvement",
    color: "bg-amber-400 border-amber-500 text-white",
  },
  {
    value: 4,
    label: "Proficient",
    desc: "Competent, works independently",
    color: "bg-lime-500 border-lime-600 text-white",
  },
  {
    value: 5,
    label: "Expert",
    desc: "Mastery, can mentor others",
    color: "bg-emerald-500 border-emerald-600 text-white",
  },
];

function RatingScale({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {SCALE.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          title={s.desc}
          className={cn(
            "flex flex-col items-center px-3 py-1.5 rounded-xl border-2 transition-all duration-200 min-w-[60px]",
            value === s.value
              ? s.color + " scale-105 shadow-md"
              : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400",
          )}
        >
          <span className="text-lg font-bold leading-none">{s.value}</span>
          <span className="text-[10px] font-medium mt-0.5">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

export function RatingLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {SCALE.map((s) => (
        <div
          key={s.value}
          className="flex items-center gap-1.5 text-xs text-gray-600"
        >
          <span
            className={cn(
              "w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px]",
              s.color.split(" ")[0],
            )}
          >
            {s.value}
          </span>
          <span>
            <strong>{s.label}</strong> – {s.desc}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RatingScale;
