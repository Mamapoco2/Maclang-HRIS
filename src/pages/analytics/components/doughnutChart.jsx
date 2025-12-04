import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

const data = [
  { name: "Human Resources", value: 12 },
  { name: "IT Department", value: 25 },
  { name: "Finance", value: 18 },
  { name: "Marketing", value: 20 },
  { name: "Cashier", value: 25 },
];

const chartConfig = {
  "Human Resources": { label: "Human Resources", color: "#3b82f6" },
  "IT Department": { label: "IT Department", color: "#22c55e" },
  Finance: { label: "Finance", color: "#f59e0b" },
  Marketing: { label: "Marketing", color: "#ef4444" },
  Cashier: { label: "Cashier", color: "#8b5cf6" },
};

export default function DepartmentDistributionChart() {
  return (
    <Card className="shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Employee Distribution by Department
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 px-2">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                nameKey="name"
                innerRadius={60}
                outerRadius={110}
              >
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
