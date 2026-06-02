import { cn } from "@/lib/utils";

export function FormField({ label, error, required, children, hint, className }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2.5 text-sm bg-[var(--background)] border rounded-lg outline-none transition-colors",
        "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
        "focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 focus:border-[var(--primary)]",
        error ? "border-red-500" : "border-[var(--border)] hover:border-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2.5 text-sm bg-[var(--background)] border rounded-lg outline-none transition-colors resize-none",
        "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
        "focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 focus:border-[var(--primary)]",
        error ? "border-red-500" : "border-[var(--border)] hover:border-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, error, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full px-3 py-2.5 text-sm bg-[var(--background)] border rounded-lg outline-none transition-colors appearance-none cursor-pointer",
        "text-[var(--foreground)]",
        "focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 focus:border-[var(--primary)]",
        error ? "border-red-500" : "border-[var(--border)] hover:border-[var(--muted-foreground)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
