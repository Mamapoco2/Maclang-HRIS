import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveBorderColor } from "../../../services/utils";
import { FaIdBadge, FaBuilding, FaUserTie } from "react-icons/fa";

export default function NodeModal({ open, onClose, node }) {
  const borderColor = resolveBorderColor(node?.data);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-full
          max-w-[95vw]
          md:max-w-xl
          lg:max-w-2xl
          p-8
          bg-card text-card-foreground
          border border-border
          rounded-2xl shadow-2xl
        "
      >
        {/* CENTERED CONTENT */}
        <div className="mx-auto w-full max-w-lg">
          {/* HEADER */}
          <DialogHeader className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            {node.data?.image && (
              <div
                className="rounded-full p-1 shadow-lg"
                style={{ backgroundColor: borderColor }}
              >
                <img
                  src={node.data.image}
                  alt={node.data?.name}
                  className="
                    w-32 h-32
                    rounded-full
                    object-cover
                    bg-background
                    border-4 border-background
                  "
                />
              </div>
            )}

            {/* Name */}
            {node.data?.name && (
              <DialogTitle
                className="
                  text-center
                  font-extrabold
                  leading-tight
                  break-words
                  text-2xl
                  sm:text-3xl
                  line-clamp-2
                "
                role={node.data.name}
              >
                {node.data.name}
              </DialogTitle>
            )}

            {/* Role */}
            {node.data?.role && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaUserTie className="opacity-70" />
                <p className="text-lg font-medium">{node.data.role}</p>
              </div>
            )}

            {/* Employee ID */}
            {node.data?.employeeId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaIdBadge className="opacity-70" />
                <span>{node.data.employeeId}</span>
              </div>
            )}
          </DialogHeader>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-border" />

          {/* DETAILS */}
          <div className="space-y-4">
            {node.data?.department && (
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <FaBuilding className="text-xl opacity-70" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-semibold">{node.data.department}</p>
                </div>
              </div>
            )}

            {node.data?.label && (
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <FaUserTie className="text-xl opacity-70" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground"></p>
                  <p className="font-semibold">{node.data.label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
