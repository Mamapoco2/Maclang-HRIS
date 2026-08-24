// src/pages/profile/components/Primitives.jsx
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}) {
  return (
    <div className={cn("space-y-1.5 min-w-0", className)}>
      <Label
        htmlFor={id}
        className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-gray-400 leading-snug">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-rose-500 leading-snug">{error}</p>
      )}
    </div>
  );
}

export function Section({ title, description, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 border-b border-gray-100 pb-3">
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-gray-900/5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-gray-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-700">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Grid2({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {children}
    </div>
  );
}
