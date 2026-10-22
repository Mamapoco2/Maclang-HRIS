import { SearchX } from "lucide-react";

export default function EmployeeEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No employees found</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Try a different name or clear the filters to see everyone again.
      </p>
    </div>
  );
}
