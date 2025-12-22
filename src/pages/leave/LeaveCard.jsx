import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ApplyLeaveDialog from "./ApplyLeaveDialog";

export default function LeaveCard({ leave }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{leave.name}</span>
            <Badge variant="secondary">{leave.code}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {leave.description}
          </p>

          <div className="flex justify-between">
            <span>Annual Credits</span>
            <span className="font-medium">
              {leave.days ?? "Subject to approval"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Pay Status</span>
            <span className="font-medium">
              {leave.paid ? "With Pay" : "Without Pay"}
            </span>
          </div>

          <Button className="w-full" onClick={() => setOpen(true)}>
            Apply Leave
          </Button>
        </CardContent>
      </Card>

      {/* Modal */}
      <ApplyLeaveDialog
        open={open}
        setOpen={setOpen}
        leave={leave}
      />
    </>
  );
}
