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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sticky header — outside the padded wrapper */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl flex-shrink-0">
            <CalendarDays size={20} className=" text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              Hospital Employee of the Month
            </h1>
            <p className="text-xs text-gray-500 leading-tight">
              Rankings based on SPMS and Appraisal Report scores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 whitespace-nowrap flex-shrink-0">
          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
          {MONTH_YEAR}
        </div>
      </div>

      {/* Rest of page content */}
      <div className="p-5 space-y-6">
        <SummaryStats />
        <ChampionCard player={champion} />
        <div className="grid grid-cols-2 gap-4">
          <PodiumCard player={second} />
          <PodiumCard player={third} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Other nominees
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <RankingTable players={rest} />
        <p className="text-xs text-gray-400 text-center pb-2">
          Scores are computed as SPMS (max 50) + Appraisal Report (max 50) = 100
          pts total
        </p>
      </div>
    </div>
  );
}
