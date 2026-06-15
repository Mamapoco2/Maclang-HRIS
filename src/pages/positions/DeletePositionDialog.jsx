import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Generic delete confirmation dialog for COS / Consultant positions.
 *
 * Props
 * ─────
 * open         boolean
 * onOpenChange (v: boolean) => void
 * position     object | null
 * loading      boolean
 * onConfirm    () => void | Promise<void>
 * label        string  — "COS" | "Consultant"
 */
export default function DeletePositionDialog({
  open,
  onOpenChange,
  position,
  loading,
  onConfirm,
  label,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[400px] bg-white border border-gray-200 shadow-xl p-0 overflow-hidden rounded-xl">
        <div className="px-6 pt-7 pb-4 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center w-11 h-11 rounded-full bg-red-50 border border-red-100">
            <AlertTriangle className="text-red-500" size={22} strokeWidth={2} />
          </div>

          <AlertDialogHeader className="space-y-1.5">
            <AlertDialogTitle className="text-gray-900 text-base font-semibold leading-tight">
              Delete {label} Position?
            </AlertDialogTitle>
          </AlertDialogHeader>
        </div>

        <div className="px-6 pb-6">
          <AlertDialogDescription className="text-sm text-gray-500 leading-relaxed text-center">
            <span className="font-semibold text-gray-800">
              {position?.title ?? "This position"}
            </span>{" "}
            will be permanently removed. This action cannot be undone.
          </AlertDialogDescription>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end">
          <AlertDialogCancel
            disabled={loading}
            className="text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 h-9 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="text-sm font-medium bg-red-500 hover:bg-red-600 text-white h-9 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
