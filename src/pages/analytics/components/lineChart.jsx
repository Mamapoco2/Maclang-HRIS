import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  Legend,
} from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "Employee growth trend";

// ✅ HR Employee Growth Data
const chartData = [
  { date: "Jan", regular: 120, contractual: 40 },
  { date: "Feb", regular: 130, contractual: 45 },
  { date: "Mar", regular: 135, contractual: 48 },
  { date: "Apr", regular: 140, contractual: 50 },
  { date: "May", regular: 150, contractual: 55 },
  { date: "Jun", regular: 155, contractual: 58 },
  { date: "Jul", regular: 160, contractual: 60 },
  { date: "Aug", regular: 162, contractual: 62 },
  { date: "Sep", regular: 168, contractual: 65 },
  { date: "Oct", regular: 170, contractual: 67 },
  { date: "Nov", regular: 175, contractual: 68 },
  { date: "Dec", regular: 180, contractual: 70 },
];

const chartConfig = {
  regular: { label: "Regular Employees", color: "var(--chart-2)" },
  contractual: { label: "Contractual Employees", color: "var(--chart-5)" },
};

export default function EmployeeGrowthTrend() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (timeRange === "90d") return chartData.slice(0, 12);
    if (timeRange === "30d") return chartData.slice(9, 12);
    if (timeRange === "7d") return chartData.slice(11);
    return chartData;
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Employee Growth Trend</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Employee headcount for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>

        <CardAction>
          {/* Toggle for large screens */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          {/* Select for small screens */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            {/* Gradients */}
            <defs>
              <linearGradient id="fillRegular" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.regular.color}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.regular.color}
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillContractual" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.contractual.color}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.contractual.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />

            <Area
              dataKey="regular"
              type="natural"
              fill="url(#fillRegular)"
              stroke={chartConfig.regular.color}
              stackId="a"
            />
            <Area
              dataKey="contractual"
              type="natural"
              fill="url(#fillContractual)"
              stroke={chartConfig.contractual.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
