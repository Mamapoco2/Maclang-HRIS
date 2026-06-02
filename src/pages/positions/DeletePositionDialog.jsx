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
      <AlertDialogContent className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl p-0 overflow-hidden rounded-lg">
        <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-red-100/40 rounded-full blur-md" />
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200">
              <AlertTriangle className="text-red-600" size={24} strokeWidth={2.5} />
            </div>
          </div>

          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-slate-900 text-lg font-semibold leading-tight">
              Delete {label} Position?
            </AlertDialogTitle>
          </AlertDialogHeader>
        </div>

        <div className="px-6 pb-6">
          <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">
                {position?.title ?? "this position"}
              </span>
              .
            </p>
            <p className="text-xs text-slate-500 flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>This action cannot be undone.</span>
            </p>
          </AlertDialogDescription>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
          <AlertDialogCancel
            disabled={loading}
            className="text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 h-9 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white h-9 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete Position</span>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
