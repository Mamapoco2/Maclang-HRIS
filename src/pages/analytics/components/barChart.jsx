import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { month: "Jan", applications: 120 },
  { month: "Feb", applications: 95 },
  { month: "Mar", applications: 140 },
  { month: "Apr", applications: 110 },
  { month: "May", applications: 180 },
  { month: "Jun", applications: 165 },
  { month: "Jul", applications: 190 },
  { month: "Aug", applications: 175 },
  { month: "Sep", applications: 130 },
  { month: "Oct", applications: 155 },
  { month: "Nov", applications: 145 },
  { month: "Dec", applications: 185 },
];

export default function MonthlyApplicationsChart() {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Monthly Job Applications</CardTitle>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis />
            <Tooltip />
            <Legend className="text-xs" />

            <Bar
              dataKey="applications"
              name="Applications"
              fill="var(--chart-2)"
              opacity={0.7}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
