import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Human Resources", value: 12 },
  { name: "IT Department", value: 25 },
  { name: "Finance", value: 18 },
  { name: "Marketing", value: 20 },
  { name: "Cashier", value: 25 },
];

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DepartmentDistributionChart() {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Employee Distribution by Department</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              content={({ payload }) => (
                <ul className="text-[10px] space-y-1">
                  {payload.map((entry, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
