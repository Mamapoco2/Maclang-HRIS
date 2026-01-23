import SummaryCard from "./components/statCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function OverviewTab() {
  const manpowerData = [
    { name: "Plantilla", value: 128, color: "var(--chart-1)" },
    { name: "COS", value: 96, color: "var(--chart-2)" },
    { name: "Consultant", value: 14, color: "var(--chart-3)" },
    { name: "Vacant", value: 3, color: "var(--chart-4)" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Manpower Mapping Overview
        </h1>
        <p className="text-sm text-gray-600">
          Government manpower application and approval statistics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total number of plantilla employees" value={128} />
        <SummaryCard title="Total number of COS employees" value={96} />
        <SummaryCard title="Total number of consultant employees" value={14} />
        <SummaryCard title="Vacant positions" value={3} />
      </div>

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">
            Workforce Distribution by Employment Type
          </CardTitle>
        </CardHeader>

        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={manpowerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />

              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {manpowerData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
