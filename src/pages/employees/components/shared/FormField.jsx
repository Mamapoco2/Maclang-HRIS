import { cn } from "@/lib/utils";

export function FormSection({ label, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap">
          {label}
        </p>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </section>
  );
}

export function FieldSelect({ label, children, className = "" }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

export function NativeSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field-input cursor-pointer appearance-none"
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: 36,
        padding: "0 10px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontSize: 12,
        fontFamily: "inherit",
        textTransform: "uppercase",
        color: "#111827",
        background: "white",
        outline: "none",
        letterSpacing: "0.02em",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
