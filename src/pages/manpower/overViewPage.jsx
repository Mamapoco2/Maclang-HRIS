import { useState, useEffect } from "react";
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
  getEmploymentSummary,
  getVacantCount,
} from "@/services/manpowerService";
import { getManPowerData } from "../../services/manpowerService";

export default function OverviewTab() {
  useEffect(() => {
    const test = async () => {
      try {
        const data = await getManPowerData();
        console.log("Get Man Power Data:", data);
      } catch (e) {
        console.log(e);
      }
    };

    test();
  }, []);

  const [counts, setCounts] = useState({
    Plantilla: 0,
    COS: 0,
    Consultant: 0,
    Vacant: 0,
  });

  const [manpowerData, setManpowerData] = useState([
    { name: "Plantilla", value: 0, color: "#4ade80" },
    { name: "COS", value: 0, color: "#60a5fa" },
    { name: "Consultant", value: 0, color: "#facc15" },
    { name: "Vacant", value: 0, color: "#f87171" },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const summary = await getEmploymentSummary();
        const vacant = await getVacantCount().catch(() => 0);
        const updatedCounts = {
          ...summary,
          Vacant: vacant,
        };

        setCounts(updatedCounts);

        setManpowerData([
          {
            name: "Plantilla",
            value: updatedCounts.Plantilla,
            color: "var(--chart-2)",
          },
          { name: "COS", value: updatedCounts.COS, color: "var(--chart-3)" },
          {
            name: "Consultant",
            value: updatedCounts.Consultant,
            color: "var(--chart-4)",
          },
          {
            name: "Vacant",
            value: updatedCounts.Vacant,
            color: "var(--chart-5)",
          },
        ]);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      }
    }

    fetchData();
  }, []);

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
          value={counts.Plantilla}
        />
        <SummaryCard title="Total number of COS employees" value={counts.COS} />
        <SummaryCard
          title="Total number of consultant employees"
          value={counts.Consultant}
        />
        <SummaryCard title="Vacant positions" value={counts.Vacant} />
      </div>

      {/* Bar Chart */}
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

      <div className="flex flex-col"></div>
    </div>
  );
}
