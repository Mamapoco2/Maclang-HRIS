import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
  ChartLegend,
} from "@/components/ui/chart";
import { KPICard, SectionCard } from "./SharedComponents";
import { KPI_DATA, PRE_POST_DATA, MONTHLY_TREND, GAP_REDUCTION } from "../data";
import { BookOpen, CheckCircle, Award, TrendingUp, Users } from "lucide-react";

const ICON_MAP = { BookOpen, CheckCircle, Award, TrendingUp, Users };

// ── Chart configs ────────────────────────────────────────────
const prePostConfig = {
  pre: { label: "Pre-Training", color: "var(--chart-2)" },
  post: { label: "Post-Training", color: "var(--chart-1)" },
};

const monthlyConfig = {
  enrolled: { label: "Enrolled", color: "var(--chart-2)" },
  completions: { label: "Completed", color: "var(--chart-1)" },
};

const gapConfig = {
  gap: { label: "Avg Gap Score", color: "var(--chart-5)" },
};

const effectivenessConfig = {
  effectiveness: { label: "Effectiveness", color: "var(--chart-3)" },
};

export default function DashboardTab() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_DATA.map((k) => (
          <KPICard key={k.label} {...k} icon={ICON_MAP[k.icon]} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pre vs Post — Gradient Bar */}
        <SectionCard
          title="Pre vs Post Training Score"
          subtitle="Department-wise skill level comparison"
        >
          <ChartContainer
            config={prePostConfig}
            className="aspect-auto h-[260px]"
          >
            <BarChart data={PRE_POST_DATA} barCategoryGap="35%">
              <defs>
                <linearGradient id="fillPre" x1="0" y1="0" x2="0" y2="1">
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
                <linearGradient id="fillPost" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.3}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="dept"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[40, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="pre" fill="url(#fillPre)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="post" fill="url(#fillPost)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SectionCard>

        {/* Monthly Trends — Gradient Area */}
        <SectionCard
          title="Monthly Training Trends"
          subtitle="Enrollment vs completions over time"
        >
          <ChartContainer
            config={monthlyConfig}
            className="aspect-auto h-[260px]"
          >
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="fillEnrolled" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="fillCompletions"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
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
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="enrolled"
                type="natural"
                fill="url(#fillEnrolled)"
                stroke="var(--chart-2)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="completions"
                type="natural"
                fill="url(#fillCompletions)"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap — Gradient Bar */}
        <SectionCard
          title="Skill Gap Reduction"
          subtitle="Quarterly progress on closing skill gaps"
        >
          <ChartContainer config={gapConfig} className="aspect-auto h-[220px]">
            <BarChart data={GAP_REDUCTION}>
              <defs>
                <linearGradient id="fillGap" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-5)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-5)"
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
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="gap" fill="url(#fillGap)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SectionCard>

        {/* Effectiveness — Gradient Area */}
        <SectionCard
          title="Effectiveness Score Trend"
          subtitle="Monthly trainer & program effectiveness rating"
        >
          <ChartContainer
            config={effectivenessConfig}
            className="aspect-auto h-[220px]"
          >
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient
                  id="fillEffectiveness"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-3)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.1}
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
              <YAxis
                domain={[6, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(v) => [v.toFixed(1), "Score"]}
                  />
                }
              />
              <Area
                dataKey="effectiveness"
                type="natural"
                fill="url(#fillEffectiveness)"
                stroke="var(--chart-3)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        </SectionCard>
      </div>
    </div>
  );
}
