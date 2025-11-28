"use client";

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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

// Updated chart data with desktop & mobile breakdown
const chartData = [
  { date: "Jan", desktop: 2800, mobile: 1200 },
  { date: "Feb", desktop: 1500, mobile: 1000 },
  { date: "Mar", desktop: 2000, mobile: 1200 },
  { date: "Apr", desktop: 1700, mobile: 1000 },
  { date: "May", desktop: 2500, mobile: 1500 },
  { date: "Jun", desktop: 2300, mobile: 1500 },
  { date: "Jul", desktop: 2700, mobile: 1500 },
  { date: "Aug", desktop: 2600, mobile: 1300 },
  { date: "Sep", desktop: 2100, mobile: 1000 },
  { date: "Oct", desktop: 2400, mobile: 1200 },
  { date: "Nov", desktop: 2200, mobile: 1100 },
  { date: "Dec", desktop: 2600, mobile: 1500 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-2)" }, // Blue
  mobile: { label: "Mobile", color: "var(--chart-5)" }, // Purple
};

export default function LineChartCard() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  // Filter data based on timeRange
  const filteredData = React.useMemo(() => {
    if (timeRange === "90d") return chartData.slice(0, 12); // last 3 months simulated with full data
    if (timeRange === "30d") return chartData.slice(9, 12); // Oct-Dec
    if (timeRange === "7d") return chartData.slice(11); // Dec only
    return chartData;
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          {/* Toggle for larger screens */}
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

          {/* Select for smaller screens */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
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
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.desktop.color}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.desktop.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.mobile.color}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.mobile.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <Tooltip
              content={({ payload, label }) => (
                <ChartTooltipContent
                  labelFormatter={() => label}
                  indicator="dot"
                  data={payload?.[0]?.payload}
                />
              )}
            />
            <Legend />

            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke={chartConfig.desktop.color}
              stackId="a"
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke={chartConfig.mobile.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
