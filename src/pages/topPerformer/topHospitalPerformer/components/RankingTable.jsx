import { motion } from "framer-motion";
import { avatarColor, initials, TrendIndicator } from "./atoms";

const ROW = "grid items-center gap-x-3 px-5";
const COLS = {
  gridTemplateColumns:
    "2rem minmax(0,2fr) minmax(0,1.4fr) 3.5rem 3.5rem 3.5rem 2.5rem",
};

export const RankingTable = ({ players }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm w-full">
    {/* Header */}
    <div
      className={`${ROW} py-3 bg-gray-50/80 border-b border-gray-100`}
      style={COLS}
    >
      {["#", "Employee", "Department", "SPMS", "AR", "Score", "Trend"].map(
        (h, i) => (
          <span
            key={h}
            className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${i >= 3 ? "text-right" : ""}`}
          >
            {h}
          </span>
        ),
      )}
    </div>
    {players.map((player, i) => (
      <RankingRow key={player.id} player={player} index={i} />
    ))}
  </div>
);

const RankingRow = ({ player, index }) => {
  const color = avatarColor(player.name);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.25 + index * 0.04,
        duration: 0.3,
        ease: "easeOut",
      }}
      className={`${ROW} py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-default`}
      style={COLS}
    >
      <span className="text-sm font-semibold text-gray-400">{player.rank}</span>

      {/* Name + position */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${color}`}
        >
          {initials(player.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {player.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{player.position}</p>
        </div>
      </div>

      <span className="text-xs text-gray-500 truncate">
        {player.department}
      </span>
      <span className="text-sm text-gray-600 text-right tabular-nums">
        {player.spms}
      </span>
      <span className="text-sm text-gray-600 text-right tabular-nums">
        {player.appraisal}
      </span>
      <span className="text-sm font-bold text-gray-900 text-right tabular-nums">
        {player.score}
      </span>
      <div className="flex justify-end">
        <TrendIndicator trend={player.trend} amount={player.trendAmount} />
      </div>
    </motion.div>
  );
};
