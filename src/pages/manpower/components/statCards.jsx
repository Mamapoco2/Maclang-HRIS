import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCard({ title, value = "--", trend, status }) {
  const trendColor = trend?.startsWith("-") ? "text-red-700" : "text-green-700";

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>

        <div className="text-3xl font-semibold text-gray-900">{value}</div>

        {trend && (
          <div className={`text-xs font-medium ${trendColor}`}>
            {trend} from previous period
          </div>
        )}

        <div className="text-sm text-gray-700">{status}</div>
      </CardContent>
    </Card>
  );
}
