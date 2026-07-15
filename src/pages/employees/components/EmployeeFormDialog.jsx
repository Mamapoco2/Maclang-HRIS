import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import EmployeeForm from "./EmployeeForm";

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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
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
