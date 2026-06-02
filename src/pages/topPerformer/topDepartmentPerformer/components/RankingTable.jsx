import { motion } from "framer-motion";
import { avatarColor, initials, TrendIndicator } from "./atoms";

const ROW = "grid items-center gap-x-3 px-5";
const COLS = {
  gridTemplateColumns:
    "2rem minmax(0,2fr) minmax(0,1.4fr) 3.5rem 3.5rem 3.5rem 2.5rem",
};

export const RankingTable = ({ players }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-full">
    {/* Header */}
    <div
      className={`${ROW} py-3 bg-gray-50 border-b border-gray-100`}
      style={COLS}
    >
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        #
      </span>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Employee
      </span>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Department
      </span>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
        SPMS
      </span>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
        AR
      </span>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
        Score
      </span>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
        Trend
      </span>
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
      className={`${ROW} py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors cursor-default`}
      style={COLS}
    >
      <span className="text-sm font-medium text-gray-400">{player.rank}</span>

      {/* Name + position */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${color}`}
        >
          {initials(player.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {player.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{player.position}</p>
        </div>
      </div>

      {/* Department */}
      <span className="text-xs text-gray-500 truncate">
        {player.department}
      </span>

      {/* Scores */}
      <span className="text-sm text-gray-600 text-right">{player.spms}</span>
      <span className="text-sm text-gray-600 text-right">
        {player.appraisal}
      </span>
      <span className="text-sm font-semibold text-gray-900 text-right">
        {player.score}
      </span>

      <div className="flex justify-end">
        <TrendIndicator trend={player.trend} amount={player.trendAmount} />
      </div>
    </motion.div>
  );
};
