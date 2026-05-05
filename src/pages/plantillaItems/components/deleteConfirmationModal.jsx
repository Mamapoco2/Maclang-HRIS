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

export default function RemoveSlotDialog({
  open,
  onOpenChange,
  item,
  loading,
  onConfirm,
}) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl p-0 overflow-hidden rounded-lg">
        {/* Icon Section with gradient background */}
        <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-red-100/40 rounded-full blur-md" />
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200">
              <AlertTriangle
                className="text-red-600"
                size={24}
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Header Section */}
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-slate-900 text-lg font-semibold leading-tight">
              Remove Position Slot?
            </AlertDialogTitle>
          </AlertDialogHeader>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6">
          <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              This will remove slot{" "}
              <span className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-xs font-semibold text-slate-900">
                {item?.item_number ?? "—"}
              </span>
              {item?.item?.title && (
                <>
                  {" "}
                  under{" "}
                  <span className="font-semibold text-slate-900">
                    {item.item.title}
                  </span>
                </>
              )}
              .
            </p>
            <p className="text-xs text-slate-500 flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>Only vacant slots can be removed</span>
            </p>
            <p className="text-xs text-slate-500 flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>This action cannot be undone</span>
            </p>
          </AlertDialogDescription>
        </div>

        {/* Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
          <AlertDialogCancel
            disabled={loading}
            className="text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 h-9 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="text-sm font-medium bg-red-600 hover:bg-red-700 active:bg-red-800 text-white h-9 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <span>Remove Slot</span>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
