import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const POPOVER_STYLE = {
  width: "var(--radix-popover-trigger-width)",
  minWidth: 200,
};

function ComboboxTrigger({ children, hasValue, disabled }) {
  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        disabled={disabled}
        className={cn(
          "h-9 w-full justify-between px-3 font-normal",
          !hasValue && "text-muted-foreground",
        )}
      >
        <span className="truncate">{children}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

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
      <ComboboxTrigger hasValue={!!label} disabled={disabled}>
        {label || placeholder}
      </ComboboxTrigger>
      <PopoverContent
        className="p-0"
        style={POPOVER_STYLE}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="max-h-64">
          <CommandInput placeholder="Search..." />
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found
          </CommandEmpty>
          <div className="max-h-48 overflow-y-auto overscroll-contain">
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  disabled={opt.disabled}
                  className={cn(opt.disabled && "pointer-events-none opacity-50")}
                  onSelect={() => {
                    if (!opt.disabled) {
                      onChange(opt.value === value ? "" : opt.value);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                  {opt.disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">
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

export function MultiCombobox({
  value = [],
  onChange,
  options = [],
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [value].filter(Boolean);

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <ComboboxTrigger hasValue={selected.length > 0}>
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </ComboboxTrigger>
        <PopoverContent
          className="p-0"
          style={POPOVER_STYLE}
          onWheel={(e) => e.stopPropagation()}
        >
          <Command className="max-h-64">
            <CommandInput placeholder="Search..." />
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results
            </CommandEmpty>
            <div className="max-h-48 overflow-y-auto overscroll-contain">
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => toggle(opt.value)}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
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
        <div className="flex flex-wrap gap-1.5">
          {selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <Badge key={v} variant="secondary" className="gap-1 pr-1">
                {opt?.label ?? v}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  aria-label={`Remove ${opt?.label ?? v}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
