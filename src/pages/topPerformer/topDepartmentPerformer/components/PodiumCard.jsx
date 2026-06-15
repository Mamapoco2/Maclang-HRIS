import { motion } from "framer-motion";
import { avatarColor, initials, ScoreBar, RatingBadge, ScoreTags, TrendIndicator } from "./atoms";

const RANK_STYLE = {
  2: {
    strip: "bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300",
    rankBg: "bg-slate-50 border-slate-200 text-slate-600",
    scoreFg: "text-slate-700",
    barColor: "bg-slate-400",
    border: "border-slate-100",
  },
  3: {
    strip: "bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300",
    rankBg: "bg-orange-50 border-orange-200 text-orange-700",
    scoreFg: "text-orange-700",
    barColor: "bg-orange-400",
    border: "border-orange-100",
  },
};

export const PodiumCard = ({ player }) => {
  const style = RANK_STYLE[player.rank];
  const color = avatarColor(player.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (player.rank - 2) * 0.08, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`bg-white border ${style.border} rounded-2xl overflow-hidden shadow-sm cursor-default`}
    >
      <div className={`h-0.5 ${style.strip}`} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Rank */}
          <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold ${style.rankBg}`}>
            {player.rank}
          </div>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${color}`}>
            {initials(player.name)}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{player.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{player.position}</p>
                <p className="text-xs text-gray-400">{player.department}</p>
                <div className="mt-1.5">
                  <RatingBadge rating={player.rating} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-bold ${style.scoreFg}`}>{player.score}</div>
                <div className="text-xs text-gray-400">/ 100</div>
                <TrendIndicator trend={player.trend} amount={player.trendAmount} />
              </div>
            </div>
            <div className="mt-3">
              <ScoreBar score={player.score} color={style.barColor} />
              <ScoreTags spms={player.spms} appraisal={player.appraisal} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
