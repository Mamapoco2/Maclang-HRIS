import { ClipboardList, BarChart2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "questionnaire",
    label: "Self-Assessment",
    icon: <ClipboardList className="w-4 h-4" />,
  },

  {
    id: "manager",
    label: "Manager Guide",
    icon: <Users className="w-4 h-4" />,
  },
];

function NavTabs({ active, onChange, completedCount, totalCount }) {
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
                active === tab.id
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "questionnaire" && completedCount > 0 && (
                <span className="bg-sky-100 text-sky-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {percent}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavTabs;
