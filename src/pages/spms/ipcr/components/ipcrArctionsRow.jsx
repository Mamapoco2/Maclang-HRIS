import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function IPCRActionsRow({ id }) {
  return (
    <div className="flex justify-end gap-2">
      <Link to={`/spms/ipcr/${id}/edit`}>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </Link>

      <Link to={`/spms/ipcr/${id}/view`}>
        <Button size="sm" variant="secondary">
          View
        </Button>
      </Link>

      <Link to={`/spms/ipcr/${id}/rate`}>
        <Button size="sm">Rate</Button>
      </Link>
    </div>
  );
}
