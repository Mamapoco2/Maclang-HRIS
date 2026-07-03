import { Card, CardContent } from "@/components/ui/card";

export function SummaryCard({ title, value, trend, status }) {
  return (
    <Card className="p-4">
      <CardContent className="grid gap-2">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-green-600">{trend}</div>
        <div className="text-sm">{status}</div>
      </CardContent>
    </Card>
  );
}
