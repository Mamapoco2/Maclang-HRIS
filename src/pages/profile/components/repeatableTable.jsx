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
import { Plus, Trash2, Inbox } from "lucide-react";
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
    <div className="space-y-2 min-w-0">
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}

      {/* Desktop */}
      <div className="hidden sm:block rounded-lg border border-gray-200 overflow-x-auto min-w-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-2.5 py-2 text-left font-semibold uppercase text-gray-500 tracking-wide whitespace-nowrap"
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
                  className="px-3 py-8 text-center text-gray-400 text-xs"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-gray-300" />
                    <span>
                      No entries yet. Click{" "}
                      <span className="font-semibold text-gray-500">
                        "{addLabel}"
                      </span>{" "}
                      to add one.
                    </span>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                {columns.map((c) => (
                  <td key={c.key} className="px-1.5 py-1.5 min-w-[120px]">
                    <CellInput c={c} row={row} i={i} updateCell={updateCell} />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-rose-500 hover:bg-rose-50"
                    onClick={() => removeRow(i)}
                    title="Remove this entry"
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
          <div className="flex flex-col items-center gap-1.5 text-center text-gray-400 text-xs py-6 rounded-lg border border-gray-200">
            <Inbox className="w-4 h-4 text-gray-300" />
            <span>
              No entries yet. Tap{" "}
              <span className="font-semibold text-gray-500">"{addLabel}"</span>{" "}
              to add one.
            </span>
          </div>
        )}
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 p-3 space-y-2 relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-rose-500 hover:bg-rose-50 absolute top-2 right-2"
              onClick={() => removeRow(i)}
              title="Remove this entry"
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
        className="text-xs h-8 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
