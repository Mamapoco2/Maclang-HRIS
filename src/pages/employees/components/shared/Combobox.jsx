import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function SingleCombobox({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  displayLabel,
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const label = displayLabel || selectedOption?.label || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "field-input justify-between cursor-pointer hover:border-gray-400",
            !label && "text-gray-300",
          )}
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
            color: label ? "#111827" : "#d1d5db",
            background: "white",
            outline: "none",
            letterSpacing: "0.02em",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span className="truncate">{label || placeholder}</span>
          <ChevronsUpDown className="w-3 h-3 opacity-40 flex-shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)", minWidth: 200 }}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="max-h-56">
          <CommandInput placeholder={`Search...`} className="text-xs" />
          <CommandEmpty className="text-xs py-3 text-center text-gray-400">
            No results found
          </CommandEmpty>
          <div className="overflow-y-auto max-h-44 overscroll-contain">
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  disabled={opt.disabled}
                  className={cn(
                    "uppercase text-xs",
                    opt.disabled && "opacity-40 pointer-events-none",
                  )}
                  onSelect={() => {
                    if (!opt.disabled) {
                      onChange(opt.value === value ? "" : opt.value);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 w-3.5 h-3.5 flex-shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                  {opt.disabled && (
                    <span className="ml-auto text-[10px] text-gray-300 normal-case">
                      Occupied
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function MultiCombobox({ value = [], onChange, options = [], placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [value].filter(Boolean);
  const selectedLabels = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label);

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minHeight: 36,
              padding: "0 10px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "inherit",
              textTransform: "uppercase",
              color: selectedLabels.length ? "#111827" : "#d1d5db",
              background: "white",
              outline: "none",
              letterSpacing: "0.02em",
              cursor: "pointer",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span className="truncate">
              {selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : placeholder}
            </span>
            <ChevronsUpDown className="w-3 h-3 opacity-40 flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: "var(--radix-popover-trigger-width)", minWidth: 200 }}
          onWheel={(e) => e.stopPropagation()}
        >
          <Command className="max-h-56">
            <CommandInput placeholder="Search..." className="text-xs" />
            <CommandEmpty className="text-xs py-3 text-center text-gray-400">
              No results
            </CommandEmpty>
            <div className="overflow-y-auto max-h-44 overscroll-contain">
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    className="uppercase text-xs"
                    onSelect={() => toggle(opt.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 w-3.5 h-3.5 flex-shrink-0",
                        selected.includes(opt.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200"
              >
                {opt?.label ?? v}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={`Remove ${opt?.label ?? v}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
