import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { recentLeaves } from "../../../services/leaveOverviewServices";

export default function RecentLeaveCard() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Recent Leave Filings</CardTitle>
        <CardDescription>
          Overview of the latest filed leave requests
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {recentLeaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.employee}</TableCell>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.startDate}</TableCell>
                <TableCell>{leave.endDate}</TableCell>
                <TableCell
                  className={
                    leave.status === "Approved"
                      ? "text-green-600"
                      : leave.status === "Pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {leave.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
