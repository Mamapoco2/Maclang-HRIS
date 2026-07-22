import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ITEM_HEADERS } from "../helpers/constants";

export function TableSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <TableRow key={i}>
      {ITEM_HEADERS.map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
