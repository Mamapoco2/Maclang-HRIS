import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, FileText, Clock, Star } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function SPMSDashboard() {
  const stats = [
    {
      label: "Active Period",
      value: "2026 1st Semester",
      icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />,
      badge: "Ongoing",
    },
    {
      label: "Total IPCR",
      value: 42,
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Pending Approval",
      value: 7,
      icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Average Rating",
      value: "4.23",
      icon: <Star className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  const ratingData = [
    { name: "5 - Outstanding", value: 12 },
    { name: "4 - Very Satisfactory", value: 18 },
    { name: "3 - Satisfactory", value: 8 },
    { name: "2 - Unsatisfactory", value: 4 },
  ]

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          SPMS Dashboard
        </h1>
        <p className="text-muted-foreground">
          Strategic Performance Management Overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.badge && (
                <Badge className="mt-2" variant="secondary">
                  {stat.badge}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution (Bar)</CardTitle>
            <CardDescription>
              Performance rating breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution (Pie)</CardTitle>
            <CardDescription>
              Percentage breakdown of ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
