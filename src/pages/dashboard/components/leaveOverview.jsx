import { useEffect, useState } from "react";

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

import { Loader2, AlertTriangle } from "lucide-react";

import { getRecentLeaves } from "../../../services/leaveOverviewServices";

const STATUS_COLOR = {
  Approved: "text-green-600",
  Pending: "text-yellow-600",
  Rejected: "text-red-600",
  Cancelled: "text-muted-foreground",
};

export default function RecentLeaveCard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    getRecentLeaves(5)
      .then((data) => {
        if (ignore) return;
        setLeaves(data);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("getRecentLeaves:", err);
        setError("Unable to load recent leave filings.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Card className="w-full h-full shadow-sm">
      <CardHeader>
        <CardTitle>Recent Leave Filings</CardTitle>
        <CardDescription>
          Overview of the latest filed leave requests
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading recent leave filings…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        ) : leaves.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No leave requests filed yet.
          </p>
        ) : (
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
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.employee}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{leave.startDate}</TableCell>
                  <TableCell>{leave.endDate}</TableCell>
                  <TableCell
                    className={STATUS_COLOR[leave.status] ?? "text-foreground"}
                  >
                    {leave.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
