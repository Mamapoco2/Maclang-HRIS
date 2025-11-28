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
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of performance, revenue, and user engagement.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">$56,800</p>
            <p className="text-xs text-green-600 mt-1">+12% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">1,240</p>
            <p className="text-xs text-green-600 mt-1">+8% this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">3,908</p>
            <p className="text-xs text-red-600 mt-1">-3% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">4.8%</p>
            <p className="text-xs text-green-600 mt-1">+1.1% today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-1">Total Visitors</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Total for the last 3 months
          </p>
          <LineChartComponent />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Applications per Month</h2>
          <p className="text-sm text-muted-foreground mb-4">
            January – June 2024
          </p>
          <BarChartComponent />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold mb-1">User Segments</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Distribution by category
          </p>
          <PieChartComponent />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Traffic Channels</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Breakdown by source
          </p>
          <DoughnutChartComponent />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Insights</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Revenue continues upward trend for 4th month.</p>
            <p>
              • User retention increased by{" "}
              <span className="text-green-600">+3.5%</span>.
            </p>
            <p>• Marketing referrals dropped slightly.</p>
            <p>• Subscription churn showed small improvement.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
