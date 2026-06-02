import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

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

const chartConfig = {
  applications: { label: "Applications", color: "var(--chart-2)" },
};

export default function MonthlyApplicationsChart() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Monthly Job Applications</CardTitle>
        <CardDescription>Total applications received per month</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart data={data}>
            <defs>
              <linearGradient id="fillApplications" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.3}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="applications"
              fill="url(#fillApplications)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
