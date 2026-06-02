import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import EmployeeForm from "./EmployeeForm";

/**
 * EmployeeFormDialog
 *
 * Wrapper component that handles the Dialog structure with proper accessibility.
 * This component manages the dialog state and wraps the EmployeeForm with DialogTitle
 * for screen reader support (hidden with VisuallyHidden).
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {Object} props.employee - Employee object for editing (null for creating new)
 * @param {Function} props.refresh - Callback to refresh employee list after save
 */
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
        {/* Hidden title for accessibility (screen reader only) */}
        <VisuallyHidden>
          <DialogTitle>
            {employee ? "Edit Employee" : "New Employee"}
          </DialogTitle>
        </VisuallyHidden>

        {/* Form component */}
        <EmployeeForm
          employee={employee}
          refresh={refresh}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
