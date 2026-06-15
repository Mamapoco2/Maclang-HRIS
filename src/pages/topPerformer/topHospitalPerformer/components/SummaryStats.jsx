import { motion } from "framer-motion";
import { Users, Building2, Star } from "lucide-react";

const STATS = [
  { icon: Users,     label: "Total Nominees", value: "48",     color: "bg-blue-50 text-blue-600",    border: "border-blue-100" },
  { icon: Building2, label: "Departments",     value: "12",     color: "bg-slate-50 text-slate-600",  border: "border-slate-100" },
  { icon: Star,      label: "Max Possible",    value: "100 pts", color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
];

export const SummaryStats = () => (
  <div className="grid grid-cols-3 gap-4">
    {STATS.map(({ icon: Icon, label, value, color, border }, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * i, duration: 0.3 }}
        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${color} border ${border}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </motion.div>
    ))}
  </div>
);
