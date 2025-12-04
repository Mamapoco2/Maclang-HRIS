import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import LineChartComponent from "./lineChart";
import BarChartComponent from "./barChart";
import PieChartComponent from "./pieChart";
import DoughnutChartComponent from "./doughnutChart";

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          HR Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of workforce, recruitment, and employee performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">568</p>
            <p className="text-xs text-green-600 mt-1">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              New Hires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">24</p>
            <p className="text-xs text-green-600 mt-1">+5 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">542</p>
            <p className="text-xs text-red-600 mt-1">-3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Employee Turnover Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">4.8%</p>
            <p className="text-xs text-green-600 mt-1">-0.6% this quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-1">Employee Growth Trend</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Total employees for the last 3 months
          </p>
          <LineChartComponent />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">
            Job Applications per Month
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            January – June 2024
          </p>
          <BarChartComponent />
        </div>
      </div>

      {/* Distribution + Insights */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Employee Application Distribution
          </h2>
          <p className="text-sm text-muted-foreground mb-4">By department</p>
          <PieChartComponent />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Recruitment Sources</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Breakdown by hiring channel
          </p>
          <DoughnutChartComponent />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">HR Insights</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Employee headcount increased steadily this quarter.</p>
            <p>
              • Retention rate improved by{" "}
              <span className="text-green-600">+3.5%</span>.
            </p>
            <p>• Recruitment from referrals increased.</p>
            <p>• Resignations declined compared to last month.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
