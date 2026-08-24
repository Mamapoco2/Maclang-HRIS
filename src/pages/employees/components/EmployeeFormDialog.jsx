import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import EmployeeForm from "./forms/EmployeeForm";

export default function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  refresh,
}) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-h-[92dvh] sm:max-h-[95dvh] overflow-hidden p-3 sm:p-6">
        <VisuallyHidden>
          <DialogTitle>
            {employee ? "Edit Employee" : "New Employee"}
          </DialogTitle>
        </VisuallyHidden>

        <EmployeeForm
          employee={employee}
          refresh={refresh}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
