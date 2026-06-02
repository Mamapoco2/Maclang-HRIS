import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

import { LEADERBOARD_DATA, MONTH_YEAR } from "@/lib/leaderboardData";
import { ChampionCard } from "./components/ChampionCard";
import { PodiumCard } from "./components/PodiumCard";
import { RankingTable } from "./components/RankingTable";
import { SummaryStats } from "./components/SummaryStats";

export default function EmployeeOfTheMonth() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const [champion, second, third, ...rest] = LEADERBOARD_DATA;

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <div className="p-5">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Department Employee of the Month
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Rankings based on SPMS and Appraisal Report scores
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <CalendarDays className="w-3.5 h-3.5" />
              {MONTH_YEAR}
            </div>
          </div>
        </motion.div>

        {/* Summary stats */}
        <SummaryStats />

        {/* Champion on top */}
        <div className="mb-4">
          <ChampionCard player={champion} />
        </div>

        {/* 2nd and 3rd side by side below */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <PodiumCard player={second} />
          <PodiumCard player={third} />
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Other nominees
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Ranks 4–10 */}
        <RankingTable players={rest} />

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Scores are computed as SPMS (max 50) + Appraisal Report (max 50) = 100
          pts total
        </p>
      </div>
    </div>
  );
}
