import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// A titled group of fields, e.g. "Employee information".
export function FormSection({ label, description, children }) {
  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold leading-none tracking-tight">
          {label}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// A softly tinted box used for secondary groups (compensation, position).
export function FormPanel({ title, action, children, className }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border bg-muted/40 p-4",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{title}</p>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Label + control wrapper.
export function FieldSelect({ label, children, className = "" }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

// The shadcn Select cannot use "" as an item value, so a sentinel stands in
// for "nothing selected". Callers still just see "" for empty.
const NONE = "__none__";

export function SelectField({ value, onChange, options, placeholder }) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => onChange(v === NONE ? "" : v)}
    >
      <SelectTrigger className="h-9 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {value ? (
          <SelectItem value={NONE} className="text-muted-foreground">
            Clear selection
          </SelectItem>
        ) : null}
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
