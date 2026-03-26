// src/pages/profile/components/ProfileFormFields.jsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";

const FIELD_META = {
  first_name: {
    label: "First Name",
    type: "text",
    placeholder: "JUAN",
    autoComplete: "given-name",
  },
  middle_name: {
    label: "Middle Name",
    type: "text",
    placeholder: "OSANA",
    autoComplete: "middle-name",
  },
  last_name: {
    label: "Last Name",
    type: "text",
    placeholder: "DELA CRUZ",
    autoComplete: "family-name",
  },
  gender: {
    label: "Gender",
    type: "select",
    options: ["MALE", "FEMALE"],
  },
  phone: {
    label: "Phone Number",
    type: "tel",
    placeholder: "+63 912 345 6789",
    autoComplete: "tel",
  },
  date_of_birth: {
    label: "Date of Birth",
    type: "date",
  },
  address: {
    label: "Address",
    type: "text",
    placeholder: "123 RIZAL ST, MANILA",
    autoComplete: "street-address",
  },
};

function DatePickerField({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date(1990, 0));

  // value is "YYYY-MM-DD" string or ""
  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : null;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  const handleSelect = (date) => {
    if (!date) return;
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selected ? format(selected, "MMMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Month / Year navigation selects */}
        <div className="flex gap-2 p-3 border-b">
          <Select
            value={String(month.getMonth())}
            onValueChange={(val) =>
              setMonth((prev) => new Date(prev.getFullYear(), Number(val)))
            }
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <SelectItem key={m} value={String(i)} className="text-xs">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(month.getFullYear())}
            onValueChange={(val) =>
              setMonth((prev) => new Date(Number(val), prev.getMonth()))
            }
          >
            <SelectTrigger className="h-8 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {Array.from(
                { length: new Date().getFullYear() - 1900 + 1 },
                (_, i) => 1900 + i,
              )
                .reverse()
                .map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => date > new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function ProfileFormFields({
  missingFields,
  values,
  onChange,
  fieldErrors,
}) {
  return (
    <div className="space-y-4">
      {Object.keys(missingFields)
        .filter((key) => key !== "avatar")
        .map((key) => {
          const meta = FIELD_META[key] ?? {
            label: missingFields[key],
            type: "text",
            placeholder: "",
          };
          const error = fieldErrors?.[key];

          return (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key} className="text-sm font-medium uppercase">
                {meta.label}
                <span className="text-destructive ml-1">*</span>
              </Label>

              {meta.type === "select" ? (
                <Select
                  value={values[key] ?? ""}
                  onValueChange={(val) => onChange(key, val)}
                >
                  <SelectTrigger
                    id={key}
                    className={
                      error ? "border-destructive focus:ring-destructive" : ""
                    }
                  >
                    <SelectValue placeholder={`Select ${meta.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : meta.type === "date" ? (
                <DatePickerField
                  value={values[key] ?? ""}
                  onChange={(val) => onChange(key, val)}
                  error={error}
                />
              ) : (
                <Input
                  id={key}
                  type={meta.type}
                  placeholder={meta.placeholder}
                  autoComplete={meta.autoComplete}
                  value={values[key] ?? ""}
                  onChange={(e) => onChange(key, e.target.value.toUpperCase())}
                  className={cn(
                    "uppercase placeholder:uppercase",
                    error &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              )}

              {error && (
                <p className="text-xs text-destructive uppercase">{error}</p>
              )}
            </div>
          );
        })}
    </div>
  );
}
