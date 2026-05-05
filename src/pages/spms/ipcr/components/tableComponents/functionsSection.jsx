import { FunctionTable } from "./functionTable";
import { RatingSummarySection } from "../formSection/formSections";

export function FunctionsSection({
  coreFunctions,
  supportFunctions,
  onUpdateRow,
  onUpdateWithComputation,
  onAddRow,
  onRemoveRow,
  part1,
  part2,
  totalRating,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-black mb-6 min-w-[800px]">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black p-2 w-[20%]">Output</th>
            <th className="border border-black p-2 w-[25%]">
              Success Indicators
              <br />
              <span className="font-normal text-xs">(Targets + Measures)</span>
            </th>
            <th className="border border-black p-2 w-[25%]">
              Actual Accomplishments
            </th>
            <th className="border border-black p-0 w-[15%]">
              <div className="border-b border-black py-1">RATING</div>
              <div className="flex w-full divide-x divide-black">
                <div className="w-1/4 py-1">Q</div>
                <div className="w-1/4 py-1">E</div>
                <div className="w-1/4 py-1">T</div>
                <div className="w-1/4 py-1">A</div>
              </div>
            </th>
            <th className="border border-black p-2 w-[15%]">Remarks</th>
            <th className="border-b border-t border-black w-8 print:hidden bg-white"></th>
          </tr>
        </thead>
        <tbody>
          <FunctionTable
            type="core"
            functions={coreFunctions}
            onUpdateRow={onUpdateRow}
            onUpdateWithComputation={onUpdateWithComputation}
            onAddRow={onAddRow}
            onRemoveRow={onRemoveRow}
          />

          <FunctionTable
            type="support"
            functions={supportFunctions}
            onUpdateRow={onUpdateRow}
            onUpdateWithComputation={onUpdateWithComputation}
            onAddRow={onAddRow}
            onRemoveRow={onRemoveRow}
          />

          <RatingSummarySection
            part1={part1}
            part2={part2}
            totalRating={totalRating}
          />
        </tbody>
      </table>
    </div>
  );
}
