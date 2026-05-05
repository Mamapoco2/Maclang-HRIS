import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FunctionRow } from "./functionRow";

export function FunctionTable({
  type,
  functions,
  onUpdateRow,
  onUpdateWithComputation,
  onAddRow,
  onRemoveRow,
}) {
  return (
    <>
      <tr>
        <td
          colSpan={5}
          className="border border-black p-1 font-bold bg-gray-50 text-left"
        >
          {type === "core" ? "Core Function" : "Support Function"}
        </td>
        <td className="border-b border-t border-black w-8 print:hidden bg-white"></td>
      </tr>

      {functions.map((row) => (
        <FunctionRow
          key={row.id}
          row={row}
          type={type}
          onOutputChange={(v) => onUpdateRow(type, row.id, "output", v)}
          onIndicatorsChange={(v) => onUpdateRow(type, row.id, "indicators", v)}
          onAccomplishmentsChange={(v) =>
            onUpdateRow(type, row.id, "accomplishments", v)
          }
          onQChange={(v) => onUpdateWithComputation(type, row.id, "q", v)}
          onEChange={(v) => onUpdateWithComputation(type, row.id, "e", v)}
          onTChange={(v) => onUpdateWithComputation(type, row.id, "t", v)}
          onRemarksChange={(v) => onUpdateRow(type, row.id, "remarks", v)}
          onDelete={() => onRemoveRow(type, row.id)}
        />
      ))}

      <tr className="print:hidden border border-black border-l-0 border-r-0">
        <td colSpan={6} className="p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddRow(type)}
            className="w-full border-dashed border-2"
          >
            <Plus size={14} className="mr-2" />
            Add {type === "core" ? "Core" : "Support"} Function Row
          </Button>
        </td>
      </tr>
    </>
  );
}
