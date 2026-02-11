import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function ViewTrainingModal({ training, open, onOpenChange }) {
  if (!training) return null;

  const statusStyles = {
    cancelled: "bg-destructive/10 text-destructive",
    draft: "bg-muted text-muted-foreground",
    upcoming: "bg-primary/10 text-primary",
    ongoing: "bg-green-500/10 text-green-600",
    finished: "bg-muted text-foreground",
  };

  const statusClass =
    statusStyles[training.status?.toLowerCase()] ||
    "bg-muted text-muted-foreground";

  const Item = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm text-foreground">
        {value || "-"}
      </dd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Training details</DialogTitle>
          <DialogDescription>
            View complete information about this training.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <dl className="space-y-1">
          <Item label="Program" value={training.title} />
          <Item label="Description" value={training.description} />
          <Item label="Department" value={training.department} />
          <Item label="Category" value={training.category} />
          <Item label="Instructor" value={training.instructor} />
          <Item label="Duration" value={training.duration} />

          <div className="grid grid-cols-3 gap-4 py-2">
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd className="col-span-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}`}
              >
                {training.status || "-"}
              </span>
            </dd>
          </div>

          <Item
            label="Start date"
            value={
              training.startDate
                ? new Date(training.startDate).toLocaleString()
                : "-"
            }
          />

          <Item
            label="End date"
            value={
              training.endDate
                ? new Date(training.endDate).toLocaleString()
                : "-"
            }
          />
        </dl>
      </DialogContent>
    </Dialog>
  );
}
