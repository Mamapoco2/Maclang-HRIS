import { RATING_CONFIG } from "@/lib/leaderboardData";

// Generates a consistent color from a name string
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

export const avatarColor = (name) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Score progress bar
export const ScoreBar = ({ score, max = 100, color = "bg-amber-400" }) => (
  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full ${color} transition-all duration-700`}
      style={{ width: `${(score / max) * 100}%` }}
    />
  </div>
);

// Rating pill badge
export const RatingBadge = ({ rating }) => {
  const cfg = RATING_CONFIG[rating] || RATING_CONFIG["Satisfactory"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {rating}
    </span>
  );
};

// Trend arrow
export const TrendIndicator = ({ trend, amount }) => (
  <div
    className={`flex items-center gap-0.5 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}
  >
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
      {trend === "up" ? (
        <path
          d="M6 9V3M6 3L3 6M6 3L9 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 3V9M6 9L3 6M6 9L9 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
    <span>{amount}</span>
  </div>
);

// Score breakdown tag pair
export const ScoreTags = ({ spms, appraisal }) => (
  <div className="flex items-center gap-1.5 mt-1">
    <span className="text-xs text-gray-400">
      SPMS <span className="font-semibold text-gray-600">{spms}</span>
    </span>
    <span className="text-gray-300">·</span>
    <span className="text-xs text-gray-400">
      AR <span className="font-semibold text-gray-600">{appraisal}</span>
    </span>
  </div>
);
