import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  IconCalendarPlus,
  IconCalendarCheck,
  IconClock,
  IconCalendarX,
} from "@tabler/icons-react";

export default function LeaveCardKpi() {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Leave Requests */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Leave Requests
          </CardTitle>
          <IconCalendarPlus size={16} stroke={1.5} className="text-blue-600" />
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
          <IconCalendarCheck
            size={16}
            stroke={1.5}
            className="text-green-600"
          />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">89</p>
          <p className="text-xs text-green-600 mt-1">+6 this week</p>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Pending Approvals
          </CardTitle>
          <IconClock size={16} stroke={1.5} className="text-yellow-600" />
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
          <IconCalendarX size={16} stroke={1.5} className="text-red-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">17</p>
          <p className="text-xs text-red-600 mt-1">+2 this week</p>
        </CardContent>
      </Card>
    </div>
  );
}
