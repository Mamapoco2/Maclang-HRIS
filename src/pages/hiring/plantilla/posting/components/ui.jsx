import React from "react";
import { ChevronDown, Check } from "lucide-react";

export function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary:
      "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4", icon: "h-9 w-9" };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    />
  );
}

export function Label({ children, required, className = "" }) {
  return (
    <label
      className={`mb-1.5 block text-xs font-medium text-slate-700 ${className}`}
    >
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

export function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

export function Checkbox({ checked, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex shrink-0 items-center justify-center rounded border transition-colors ${checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"}`}
      style={{ height: "18px", width: "18px" }}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
  );
}

export function Modal({ open, onClose, children, widthClass = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full ${widthClass} overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-slate-200`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerPanel({ open, onClose, children }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-xl transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
