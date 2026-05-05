// src/pages/profile/components/RepeatableTable.jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { DatePickerField } from "./datePickerField";
import { Field } from "./primitives";

// ─── RepeatableTable ──────────────────────────────────────────────────────────
function CellInput({ c, row, i, updateCell }) {
  if (c.type === "date")
    return (
      <DatePickerField
        value={row[c.key]}
        onChange={(v) => updateCell(i, c.key, v)}
      />
    );
  if (c.type === "select")
    return (
      <Select
        value={row[c.key] ?? ""}
        onValueChange={(v) => updateCell(i, c.key, v)}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {c.options.map((o) => (
            <SelectItem key={o} value={o} className="text-xs">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  return (
    <Input
      className="h-7 text-xs"
      value={row[c.key] ?? ""}
      placeholder={c.placeholder ?? ""}
      onChange={(e) => updateCell(i, c.key, e.target.value.toUpperCase())}
    />
  );
}

export function RepeatableTable({
  label,
  rows,
  onChange,
  columns,
  addLabel = "Add Row",
}) {
  const addRow = () => {
    const e = {};
    columns.forEach((c) => (e[c.key] = ""));
    onChange([...rows, e]);
  };
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const updateCell = (i, key, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}

      {/* Desktop */}
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-2 py-1.5 text-left font-semibold uppercase whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-3 text-center text-muted-foreground italic text-xs"
                >
                  No entries. Click "{addLabel}".
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className="px-1.5 py-1 min-w-[120px]">
                    <CellInput c={c} row={row} i={i} updateCell={updateCell} />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeRow(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-2">
        {rows.length === 0 && (
          <p className="text-center text-muted-foreground italic text-xs py-3 rounded-md border">
            No entries. Tap "{addLabel}".
          </p>
        )}
        {rows.map((row, i) => (
          <div key={i} className="rounded-md border p-3 space-y-2 relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive absolute top-2 right-2"
              onClick={() => removeRow(i)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {columns.map((c) => (
              <div key={c.key} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </p>
                <CellInput c={c} row={row} i={i} updateCell={updateCell} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs h-7"
        onClick={addRow}
      >
        <Plus className="h-3 w-3 mr-1" />
        {addLabel}
      </Button>
    </div>
  );
}

// ─── YesNoField ───────────────────────────────────────────────────────────────
export function YesNoField({
  id,
  label,
  value,
  detail,
  onChange,
  onDetailChange,
  detailLabel = "If YES, give details:",
}) {
  return (
    <div className="space-y-2">
      <Field id={id} label={label} required>
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="YES">YES</SelectItem>
            <SelectItem value="NO">NO</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {value === "YES" && (
        <div className="pl-3 border-l-2 border-primary/30 space-y-1">
          <Label className="text-xs text-muted-foreground">{detailLabel}</Label>
          <Input
            className="text-sm"
            value={detail ?? ""}
            onChange={(e) => onDetailChange?.(e.target.value)}
            placeholder="Provide details..."
          />
        </div>
      )}
    </div>
  );
}
