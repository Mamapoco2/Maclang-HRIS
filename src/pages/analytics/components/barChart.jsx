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
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 2500 },
  { name: "Mar", sales: 3200 },
  { name: "Apr", sales: 2700 },
  { name: "May", sales: 4000 },
  { name: "Jun", sales: 3800 },
  { name: "Jul", sales: 4200 },
  { name: "Aug", sales: 3900 },
  { name: "Sep", sales: 3100 },
  { name: "Oct", sales: 3600 },
  { name: "Nov", sales: 3300 },
  { name: "Dec", sales: 4100 },
];

export default function BarChartCard() {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis />
            <Tooltip />
            <Legend className="text-xs" />
            <Bar dataKey="sales" fill="var(--chart-2)" opacity="0.5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
