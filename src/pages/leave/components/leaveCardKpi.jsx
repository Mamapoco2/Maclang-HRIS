import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarCheck, CalendarX2, Clock, CalendarPlus } from "lucide-react";

export default function LeaveCardKpi() {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Leave Requests */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Leave Requests
          </CardTitle>
          <CalendarPlus className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">128</p>
          <p className="text-xs text-blue-600 mt-1">+14 this month</p>
        </CardContent>
      </Card>

      {/* Approved Leaves */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Approved Leaves
          </CardTitle>
          <CalendarCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">89</p>
          <p className="text-xs text-green-600 mt-1">+6 this week</p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Pending Approvals
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">22</p>
          <p className="text-xs text-yellow-600 mt-1">+3 today</p>
        </CardContent>
      </Card>

      {/* Rejected Leaves */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Rejected Requests
          </CardTitle>
          <CalendarX2 className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">17</p>
          <p className="text-xs text-red-600 mt-1">+2 this week</p>
        </CardContent>
      </Card>
    </div>
  );
}
