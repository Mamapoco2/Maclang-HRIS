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

  const enrolledCount = training.participants?.length ?? 0;
  const maxSlots = training.maxParticipants ?? 0;
  const hasMax = maxSlots > 0;
  const isFull = hasMax && enrolledCount >= maxSlots;
  const isNearFull = hasMax && !isFull && enrolledCount / maxSlots >= 0.8;

  const slotColor = isFull
    ? "text-red-500"
    : isNearFull
      ? "text-amber-600"
      : "text-green-600";

  const Item = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm text-foreground">{value || "-"}</dd>
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
          <Item
            label="Mode"
            value={
              training.trainingMode === "face-to-face"
                ? "Face to Face"
                : training.trainingMode === "online"
                  ? "Online"
                  : null
            }
          />
          <Item label="Location" value={training.eventAddress} />
          <Item label="Duration" value={training.duration} />

          {/* Status badge */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd className="col-span-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${statusClass}`}
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
                : null
            }
          />
          <Item
            label="End date"
            value={
              training.endDate
                ? new Date(training.endDate).toLocaleString()
                : null
            }
          />

          {/* Enrolled / max participants */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <dt className="text-sm text-muted-foreground">Enrolled</dt>
            <dd className="col-span-2 text-sm">
              {hasMax ? (
                <span className={`font-medium ${slotColor}`}>
                  {enrolledCount} / {maxSlots}
                  {isFull && (
                    <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-500">
                      Full
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-foreground">{enrolledCount}</span>
              )}
            </dd>
          </div>

          {/* Max participants (if set) */}
          {hasMax && (
            <div className="grid grid-cols-3 gap-4 py-2">
              <dt className="text-sm text-muted-foreground">Max slots</dt>
              <dd className="col-span-2 text-sm text-foreground">{maxSlots}</dd>
            </div>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
