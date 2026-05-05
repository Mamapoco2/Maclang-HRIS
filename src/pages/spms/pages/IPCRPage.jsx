import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { IPCRActionsRow, RatingBadge } from "@/components/RatingComponents";

const IPCRS = [
  { id: 1, name: "Juan Dela Cruz", status: "Draft" },
  { id: 2, name: "Maria Santos", status: "Rated" },
];

export default function IPCRPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">IPCR List</h1>
          <p className="text-sm text-muted-foreground">
            Individual Performance Commitment and Review
          </p>
        </div>

        <Link to="/spms/ipcr/create">
          <Button>Create IPCR</Button>
        </Link>
      </div>

      {/* TABLE CARD */}
      <Card className="shadow-sm border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-center w-[150px]">
                    Status
                  </TableHead>
                  <TableHead className="text-right w-[260px] pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {IPCRS.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No IPCR records found
                    </TableCell>
                  </TableRow>
                ) : (
                  IPCRS.map((ipcr, index) => (
                    <TableRow key={ipcr.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{ipcr.name}</TableCell>
                      <TableCell className="text-center">
                        <RatingBadge status={ipcr.status} />
                      </TableCell>
                      <TableCell className="pr-6">
                        <IPCRActionsRow id={ipcr.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
