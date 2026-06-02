import { useState, useCallback } from "react";
import {
  BookOpen,
  Download,
  Printer,
  ChevronRight,
  BarChart2,
  Target,
  Star,
  Activity,
  Brain,
} from "lucide-react";
import { ThemeToggle, TabBar } from "./components/SharedComponents";
import DashboardTab from "./components/DashboardTab";
import SkillGapTable from "./components/SkillGapTable";
import EmployeeTab from "./components/EmployeeTab";
import AIInsightsTab from "./components/AIInsightsTab";
import { exportCSV } from "./utils";
import { EMPLOYEES } from "./data";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "gaps", label: "Skill Gaps", icon: Target },
  { id: "employees", label: "Performance", icon: Activity },
  { id: "ai", label: "AI Insights", icon: Brain },
];

export default function TrainingEffectivenessModule() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dark, setDark] = useState(false);

  const toggleDark = useCallback(() => {
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  }, []);

  return (
    <div
      className={`min-h-screen dark:bg-black transition-colors duration-100 ${dark ? "dark" : ""}`}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="max-w-screen mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white">
                Training Effectiveness
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Skill Gap Analysis System · FY 2024
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(EMPLOYEES)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <ThemeToggle dark={dark} onToggle={toggleDark} />
          </div>
        </div>
      </header>

      <div className="max-w-screen mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "gaps" && <SkillGapTable />}
        {activeTab === "employees" && <EmployeeTab />}
        {activeTab === "ai" && <AIInsightsTab />}
      </div>
    </div>
  );
}
