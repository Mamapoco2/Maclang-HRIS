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
      {/* The form brings its own header, body and footer, so the dialog
          itself has no padding and just provides the frame. */}
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl">
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
