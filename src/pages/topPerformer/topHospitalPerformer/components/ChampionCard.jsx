import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { avatarColor, initials, ScoreBar, RatingBadge, ScoreTags } from "./atoms";

export const ChampionCard = ({ player }) => {
  const color = avatarColor(player.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Gold accent strip */}
        <div className="h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300" />

        <div className="p-6">
          {/* Header label */}
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
              Employee of the Month
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar + identity */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-sm font-bold text-amber-700">
                1
              </div>
              <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold ring-4 ring-amber-50 ${color}`}>
                {initials(player.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{player.name}</h2>
                <p className="text-sm text-gray-500">{player.position}</p>
                <p className="text-xs text-gray-400">{player.department}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <RatingBadge rating={player.rating} />
                  {player.wins > 0 && (
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {player.wins}× awardee
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Score block */}
            <div className="sm:ml-auto min-w-0 sm:text-right">
              <div className="flex sm:justify-end items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">{player.score}</span>
                <span className="text-sm text-gray-400">/ 100</span>
              </div>
              <ScoreBar score={player.score} color="bg-amber-400" />
              <ScoreTags spms={player.spms} appraisal={player.appraisal} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
