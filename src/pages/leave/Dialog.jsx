import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Dialog({ open, onClose, children, className }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", handler);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, onClose }) {
  return (
    <div className="flex items-start justify-between p-6 pb-4 border-b border-[var(--border)]">
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-4 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ children, className }) {
  return <h2 className={cn("text-lg font-semibold text-[var(--foreground)]", className)}>{children}</h2>;
}

export function DialogBody({ children, className }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogFooter({ children, className }) {
  return <div className={cn("flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]", className)}>{children}</div>;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", variant = "default" }) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </DialogBody>
      <DialogFooter>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm?.(); onClose?.(); }}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors",
            variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-[var(--primary)] hover:opacity-90"
          )}
        >
          {confirmLabel}
        </button>
      </DialogFooter>
    </Dialog>
  );
}

export function Drawer({ open, onClose, children, className, side = "right" }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", handler);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "absolute top-0 bottom-0 bg-[var(--card)] border-[var(--border)] shadow-2xl w-full max-w-md overflow-y-auto",
        side === "right" ? "right-0 border-l animate-slide-right" : "left-0 border-r",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
