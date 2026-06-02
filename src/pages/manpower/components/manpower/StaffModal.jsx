// src/pages/manpower/components/manpower/StaffModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import EmployeeCard from "./EmployeeCard";

export default function StaffModal({
  open,
  onClose,
  staff = [],
  departmentName,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>
              Staff - {departmentName}
              <span className="text-gray-500 font-normal ml-2">
                ({staff.length})
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {staff.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <p>No staff assigned</p>
            </div>
          ) : (
            staff.map((emp) => <EmployeeCard key={emp.id} employee={emp} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
