import { Card, CardContent } from "@/components/ui/card";
import { TargetsTable } from "@/components/RatingComponents";

const MOCK_TARGETS = [
  {
    mfo: "Personnel Services",
    indicator: "100% Staffing",
    q: 4,
    e: 4,
    t: 5,
    avg: 4.33,
  },
  {
    mfo: "Procurement",
    indicator: "On-time delivery",
    q: 3,
    e: 4,
    t: 3,
    avg: 3.33,
  },
];

export default function IPCRView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">IPCR View</h1>
        <p className="text-sm text-muted-foreground">
          Individual Performance Commitment and Review
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <TargetsTable targets={MOCK_TARGETS} />
        </CardContent>
      </Card>
    </div>
  );
}
