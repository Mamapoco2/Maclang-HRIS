// src/pages/profile/components/Primitives.jsx
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({ id, label, required, error, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wide"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

export function Grid2({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  );
}
