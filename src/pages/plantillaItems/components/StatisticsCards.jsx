import {
  LayoutList,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
} from "lucide-react";

const STAT_CARDS = [
  {
    label: "Total Items",
    key: "total_items",
    icon: LayoutList,
    iconCls: "text-blue-600",
    bgCls: "bg-blue-50",
  },
  {
    label: "Filled",
    key: "filled",
    icon: CheckCircle2,
    iconCls: "text-emerald-600",
    bgCls: "bg-emerald-50",
  },
  {
    label: "Vacant",
    key: "vacant",
    icon: CircleDashed,
    iconCls: "text-amber-500",
    bgCls: "bg-amber-50",
  },
  {
    label: "Unfilled",
    key: "unfilled",
    icon: AlertCircle,
    iconCls: "text-red-500",
    bgCls: "bg-red-50",
  },
];

export function StatisticsCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-5">
      {STAT_CARDS.map(({ label, key, icon: Icon, iconCls, bgCls }) => (
        <div
          key={key}
          className="rounded-xl border border-gray-100 bg-white px-4 py-4 flex items-center gap-3"
        >
          <div
            className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${bgCls}`}
          >
            <Icon size={16} strokeWidth={2} className={iconCls} />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">
              {loading ? "—" : stats[key]}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium truncate">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
