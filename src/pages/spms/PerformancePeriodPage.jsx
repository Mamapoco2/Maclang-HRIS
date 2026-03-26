import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { CalendarDays, Plus, Search } from "lucide-react"

export default function PerformancePeriodPage() {
  const [periods] = useState([
    { id: 1, title: "2026 1st Semester", status: "Active" },
    { id: 2, title: "2025 Annual", status: "Closed" },
  ])

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "default"
      case "Closed":
        return "secondary"
      case "Draft":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Performance Periods
          </h1>
          <p className="text-muted-foreground">
            Manage evaluation cycles and monitoring timelines
          </p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Period
        </Button>
      </div>

      {/* Stats Cards - Proper shadcn structure */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Periods</CardDescription>
            <CardTitle className="text-2xl">
              {periods.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex justify-end">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Active Period</CardDescription>
            <CardTitle className="text-2xl">
              {periods.find((p) => p.status === "Active")?.title || "None"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Closed Periods</CardDescription>
            <CardTitle className="text-2xl">
              {periods.filter((p) => p.status === "Closed").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>All Periods</CardTitle>
            <CardDescription>
              Overview of performance evaluation periods
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search period..." className="pl-9" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {periods.map((p) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {p.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(p.status)}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
