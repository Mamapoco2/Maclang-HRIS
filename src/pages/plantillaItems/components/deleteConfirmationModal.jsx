import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, TriangleAlert } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  item,
  loading,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[380px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 border border-gray-200">
            <TriangleAlert className="text-gray-700" size={20} />
          </div>

          <AlertDialogHeader className="space-y-1">
            <AlertDialogTitle className="text-gray-900 text-base font-semibold">
              Delete Plantilla Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {item?.title ?? "this item"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end">
          <AlertDialogCancel className="text-sm border-gray-200 text-gray-600 hover:bg-gray-100 h-9">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="text-sm bg-gray-900 hover:bg-black text-white h-9"
          >
            {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
