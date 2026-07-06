import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-6 pb-4 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-5/6 rounded-full" />
      </div>
      <div className="px-6 pb-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="px-6 py-3 border-t border-slate-100 flex gap-5">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </Card>
  );
}
