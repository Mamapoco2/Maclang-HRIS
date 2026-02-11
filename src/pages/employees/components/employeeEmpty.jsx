import { IconSearch } from "@tabler/icons-react";

export default function EmployeeEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <IconSearch size={48} stroke={1.5} className="text-muted-foreground" />

      <p className="font-bold text-muted-foreground">
        No result for your search
      </p>

      <p className="text-sm text-muted-foreground">
        Try using different keywords or filters.
      </p>
    </div>
  );
}
