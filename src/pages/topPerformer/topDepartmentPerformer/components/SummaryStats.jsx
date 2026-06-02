import { motion } from "framer-motion";
import { Users, Building2, Star } from "lucide-react";

const STATS = [
  { icon: Users,     label: "Total Nominees", value: "48" },
  { icon: Building2, label: "Departments",     value: "12" },
  { icon: Star,      label: "Max Possible",    value: "100 pts" },
];

export const SummaryStats = () => (
  <div className="grid grid-cols-3 gap-4 mb-8">
    {STATS.map(({ icon: Icon, label, value }, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * i, duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </motion.div>
    ))}
  </div>
);
