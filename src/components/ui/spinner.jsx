import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }) {
  return (
    <IconLoader2
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      stroke={1.5}
      {...props}
    />
  );
}

export { Spinner };
