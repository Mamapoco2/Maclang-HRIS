import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search, X as XIcon } from "lucide-react";

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

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  disabled = false,
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
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

export function Combobox({
  value,
  onChange,
  options = [],
  placeholder = "Select or type a value",
  disabled = false,
  allowCustom = true,
  emptyMessage = "No matching options.",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) setQuery(value ?? "");
  }, [value, open]);

  const autosize = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => {
    autosize(inputRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value ?? "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const trimmedQuery = query.trim();
  const exactMatch = options.some(
    (o) => o.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCustomOption =
    allowCustom && trimmedQuery.length > 0 && !exactMatch;

  const commitValue = (v) => {
    onChange(v);
    setQuery(v);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setHighlightedIndex(0);
    if (!open) setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    const totalItems = filteredOptions.length + (showCustomOption ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showCustomOption && highlightedIndex === filteredOptions.length) {
        commitValue(trimmedQuery);
      } else if (filteredOptions[highlightedIndex]) {
        commitValue(filteredOptions[highlightedIndex]);
      } else if (allowCustom) {
        commitValue(trimmedQuery);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(value ?? "");
      inputRef.current?.blur();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    inputRef.current?.focus();
    setOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <textarea
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          rows={1}
          onFocus={(e) => {
            setOpen(true);
            autosize(e.target);
          }}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="min-h-[2.25rem] max-h-56 w-full resize-none overflow-y-auto rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Clear"
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
        )}
      </div>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length === 0 && !showCustomOption && (
            <li className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</li>
          )}
          {filteredOptions.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              onMouseDown={(e) => {
                e.preventDefault();
                commitValue(o);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${
                i === highlightedIndex ? "bg-indigo-50" : ""
              } ${o === value ? "font-medium text-indigo-700" : "text-slate-700"}`}
            >
              <Check
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${o === value ? "opacity-100 text-indigo-600" : "opacity-0"}`}
              />
              <span className="whitespace-pre-wrap">{o}</span>
            </li>
          ))}
          {showCustomOption && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                commitValue(trimmedQuery);
              }}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              className={`cursor-pointer border-t border-slate-100 px-3 py-2 text-sm text-slate-600 ${
                highlightedIndex === filteredOptions.length
                  ? "bg-indigo-50"
                  : ""
              }`}
            >
              Use custom value:{" "}
              <span className="font-medium text-slate-900">
                "{trimmedQuery}"
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

const MULTI_VALUE_DELIMITER = " | ";

export function joinMultiValue(items) {
  return items.filter((s) => s && s.trim()).join(MULTI_VALUE_DELIMITER);
}

export function splitMultiValue(value) {
  if (!value) return [];
  return value
    .split(MULTI_VALUE_DELIMITER)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinMultiValueBulleted(items) {
  return items
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
}

export function splitMultiValueBulleted(value) {
  if (!value) return [];
  return value
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeQualificationDisplay(value) {
  if (!value) return value;
  return value.replace(/\s*\|\s*/g, "\n");
}

export function MultiCombobox({
  value,
  onChange,
  options = [],
  placeholder = "Select or type a value",
  disabled = false,
  allowCustom = true,
  emptyMessage = "No matching options.",
  className = "",
  format = "inline",
}) {
  const bulleted = format === "bulleted";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(
    () => (bulleted ? splitMultiValueBulleted(value) : splitMultiValue(value)),
    [value, bulleted],
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? options.filter((o) => o.toLowerCase().includes(q))
      : options;
    return base;
  }, [options, query]);

  const trimmedQuery = query.trim();
  const alreadySelected = (v) =>
    selected.some(
      (s) => s.trim().toLowerCase() === (v ?? "").trim().toLowerCase(),
    );
  const exactMatch = options.some(
    (o) => o.trim().toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCustomOption =
    allowCustom &&
    trimmedQuery.length > 0 &&
    !exactMatch &&
    !alreadySelected(trimmedQuery);

  const commitSelection = (nextSelected) => {
    onChange(
      bulleted
        ? joinMultiValueBulleted(nextSelected)
        : joinMultiValue(nextSelected),
    );
  };

  const toggleOption = (v) => {
    if (alreadySelected(v)) {
      commitSelection(
        selected.filter(
          (s) => s.trim().toLowerCase() !== v.trim().toLowerCase(),
        ),
      );
    } else {
      commitSelection([...selected, v]);
    }
    setQuery("");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const addCustom = () => {
    if (!trimmedQuery || alreadySelected(trimmedQuery)) return;
    commitSelection([...selected, trimmedQuery]);
    setQuery("");
    setHighlightedIndex(0);
  };

  const removeChip = (v) => {
    commitSelection(selected.filter((s) => s !== v));
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setHighlightedIndex(0);
    if (!open) setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    const totalItems = filteredOptions.length + (showCustomOption ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showCustomOption && highlightedIndex === filteredOptions.length) {
        addCustom();
      } else if (filteredOptions[highlightedIndex]) {
        toggleOption(filteredOptions[highlightedIndex]);
      } else if (allowCustom && trimmedQuery) {
        addCustom();
      }
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      // Quick-remove the last chip when the input is empty, like a
      // typical tag/chip input.
      removeChip(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex min-h-[2.25rem] w-full flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 ${
          disabled ? "cursor-not-allowed bg-slate-50" : ""
        }`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selected.map((item) => (
          <span
            key={item}
            className="inline-flex max-w-full items-start gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
          >
            <span className="whitespace-pre-wrap break-words">{item}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(item);
                }}
                aria-label={`Remove ${item}`}
                className="mt-0.5 shrink-0 text-indigo-400 hover:text-indigo-700"
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          value={query}
          placeholder={selected.length === 0 ? placeholder : ""}
          onFocus={() => setOpen(true)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="min-w-[8rem] flex-1 border-none bg-transparent px-1 py-0.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length === 0 && !showCustomOption && (
            <li className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</li>
          )}
          {filteredOptions.map((o, i) => {
            const isSelected = alreadySelected(o);
            return (
              <li
                key={o}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleOption(o);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${
                  i === highlightedIndex ? "bg-indigo-50" : ""
                } ${isSelected ? "font-medium text-indigo-700" : "text-slate-700"}`}
              >
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  )}
                </span>
                <span className="whitespace-pre-wrap">{o}</span>
              </li>
            );
          })}
          {showCustomOption && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                addCustom();
              }}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              className={`cursor-pointer border-t border-slate-100 px-3 py-2 text-sm text-slate-600 ${
                highlightedIndex === filteredOptions.length
                  ? "bg-indigo-50"
                  : ""
              }`}
            >
              Add custom value:{" "}
              <span className="font-medium text-slate-900">
                "{trimmedQuery}"
              </span>
            </li>
          )}
        </ul>
      )}
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
