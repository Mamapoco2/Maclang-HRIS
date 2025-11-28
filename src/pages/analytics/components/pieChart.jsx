import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";

const data = [
  { name: "Direct", value: 45 },
  { name: "Referral", value: 25 },
  { name: "Social", value: 15 },
  { name: "Other", value: 15 },
];

const COLORS = ["#ef4444", "#3b82f6", "#facc15", "#10b981"];

export default function PieChartCard() {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
