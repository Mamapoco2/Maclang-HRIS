import { useEffect, useState } from "react";
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

import {
 getManpowerSummary
} from "../../services/manpowerService";

export default function OverviewTab() {
  const [plantillaCount, setPlantillaCount] = useState(0);
  const [cosCount, setCosCount] = useState(0);
  const [consultantCount, setConsultantCount] = useState(0);
  const [vacantCount, setVacantCount] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const data = await getManpowerSummary();

        setPlantillaCount(data.plantilla);
        setCosCount(data.cos);
        setConsultantCount(data.consultant);
        setVacantCount(data.vacant);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCounts();
  }, []);

  const manpowerData = [
    { name: "Plantilla", value: plantillaCount, color: "var(--chart-1)" },
    { name: "COS", value: cosCount, color: "var(--chart-2)" },
    { name: "Consultant", value: consultantCount, color: "var(--chart-3)" },
    { name: "Vacant", value: vacantCount, color: "var(--chart-4)" },
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
        <SummaryCard
          title="Total number of plantilla employees"
          value={plantillaCount}
        />
        <SummaryCard title="Total number of COS employees" value={cosCount} />
        <SummaryCard
          title="Total number of consultant employees"
          value={consultantCount}
        />
        <SummaryCard title="Vacant positions" value={vacantCount} />
      </div>

      {/* Chart */}
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
