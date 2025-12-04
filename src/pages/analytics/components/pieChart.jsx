import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

const data = [
  { name: "Walk-in Applicants", value: 30 },
  { name: "Employee Referrals", value: 25 },
  { name: "Social Media", value: 20 },
];

const chartConfig = {
  "Walk-in Applicants": { label: "Walk-in Applicants", color: "#10b981" },
  "Employee Referrals": { label: "Employee Referrals", color: "#f59e0b" },
  "Social Media": { label: "Social Media", color: "#ef4444" },
};

export default function LeaveDistributionPieChart() {
  return (
    <Card className="shadow-sm rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Leave Distribution
        </CardTitle>
      </CardHeader>

      <CardContent className="h-80 px-2">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={data} nameKey="name" outerRadius={110}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={chartConfig[entry.name].color} />
                ))}
              </Pie>

              <ChartTooltip />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="mt-4 flex-wrap gap-3 justify-center"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
