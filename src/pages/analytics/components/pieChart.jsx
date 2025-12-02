import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

const data = [
  { name: "Walk-in Applicants", value: 30 },
  { name: "Employee Referrals", value: 25 },
  { name: "Social Media", value: 20 },
];

const COLORS = ["#ef4444", "#3b82f6", "#10b981"];

export default function RecruitmentSourcesPieChart() {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Recruitment Sources</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={data} outerRadius={100} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              content={({ payload }) => (
                <ul className="text-[10px] space-y-1">
                  {payload.map((entry, index) => (
                    <li
                      key={index}
                      className="flex items-center flex-row gap-2"
                    >
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
