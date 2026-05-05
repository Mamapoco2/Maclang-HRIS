// components/IPCRForm/EmployeeInfoSection.jsx
export function EmployeeInfoSection({ employeeInfo, onInfoChange }) {
  const handleChange = (field, value) => {
    onInfoChange({ ...employeeInfo, [field]: value });
  };

  return (
    <div className="text-sm mb-8 leading-relaxed text-justify">
      I,{" "}
      <input
        className="font-bold border-b border-black outline-none inline-block min-w-[200px] bg-transparent px-1"
        value={employeeInfo.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      ,{" "}
      <input
        className="font-bold border-b border-black outline-none inline-block min-w-[200px] bg-transparent px-1"
        value={employeeInfo.position}
        onChange={(e) => handleChange("position", e.target.value)}
      />
      , of the{" "}
      <input
        className="font-bold border-b border-black outline-none inline-block min-w-[200px] bg-transparent px-1"
        value={employeeInfo.unit}
        onChange={(e) => handleChange("unit", e.target.value)}
      />{" "}
      of{" "}
      <input
        className="font-bold border-b border-black outline-none inline-block min-w-[350px] bg-transparent px-1"
        value={employeeInfo.department}
        onChange={(e) => handleChange("department", e.target.value)}
      />{" "}
      commit to deliver and agree to be rated on the attainment of the following
      targets in accordance with the indicated measures for the period{" "}
      <input
        className="font-bold border-b border-black outline-none inline-block min-w-[150px] bg-transparent px-1"
        value={employeeInfo.period}
        onChange={(e) => handleChange("period", e.target.value)}
      />
      .
    </div>
  );
}

// components/IPCRForm/SignatureBlock.jsx
export function SignatureBlock() {
  return (
    <div className="flex justify-between items-end mb-6 text-sm">
      <div className="w-1/3 text-center mt-10">
        <input
          type="text"
          placeholder="Employee Name"
          className="w-full text-center font-bold outline-none bg-transparent"
        />
        <div className="border-t border-black pt-1">Signature of Employee</div>
      </div>

      <div className="w-1/4 text-center mt-10">
        <input
          type="text"
          placeholder="Date"
          className="w-full text-center font-bold outline-none bg-transparent"
        />
        <div className="border-t border-black pt-1">Date</div>
      </div>
    </div>
  );
}

// components/IPCRForm/ReviewApprovalSection.jsx
export function ReviewApprovalSection() {
  return (
    <table className="w-full text-sm border-collapse border border-black mb-6">
      <tbody>
        <tr>
          <td className="border border-black p-1 text-center w-1/3">
            Reviewed by:
          </td>
          <td className="border border-black p-1 text-center w-1/6">Date</td>
          <td className="border border-black p-1 text-center w-1/3">
            Approved by:
          </td>
          <td className="border border-black p-1 text-center w-1/6">Date</td>
        </tr>
        <tr>
          <td className="border border-black h-16 relative">
            <textarea className="w-full h-full absolute inset-0 resize-none outline-none p-2 bg-transparent" />
          </td>
          <td className="border border-black h-16 relative">
            <input
              type="text"
              className="w-full h-full absolute inset-0 text-center outline-none bg-transparent"
            />
          </td>
          <td className="border border-black h-16 text-center font-bold relative align-bottom pb-1">
            <input
              type="text"
              defaultValue="Dave Anthony A. Vergara, MD"
              className="w-full text-center font-bold outline-none bg-transparent"
            />
          </td>
          <td className="border border-black h-16 relative">
            <input
              type="text"
              className="w-full h-full absolute inset-0 text-center outline-none bg-transparent"
            />
          </td>
        </tr>
        <tr>
          <td className="border border-black text-center text-xs pb-1">
            <input
              type="text"
              placeholder="Position"
              className="w-full text-center outline-none bg-transparent"
            />
          </td>
          <td className="border border-black bg-gray-50"></td>
          <td className="border border-black text-center text-xs pb-1">
            <input
              type="text"
              placeholder="Position"
              className="w-full text-center outline-none bg-transparent"
            />
          </td>
          <td className="border border-black bg-gray-50"></td>
        </tr>
        <tr>
          <td
            colSpan={4}
            className="border border-black p-1 text-center text-xs"
          >
            Rating Scale: 5 – Outstanding &nbsp;&nbsp;&nbsp; 4 - Very
            Satisfactory &nbsp;&nbsp;&nbsp; 3 Satisfactory &nbsp;&nbsp;&nbsp; 2
            - Unsatisfactory &nbsp;&nbsp;&nbsp; 1 - Poor
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// components/IPCRForm/RatingSummarySection.jsx
import { getAdjectival } from "@/hooks/useIPCRRating";

export function RatingSummarySection({ part1, part2, totalRating }) {
  return (
    <>
      <tr>
        <td
          colSpan={6}
          className="border border-black p-2 bg-gray-100 font-bold text-left"
        >
          Rating Summary
        </td>
      </tr>

      <tr>
        <td colSpan={4} className="border border-black p-2 text-left">
          PART I RATING (Part I Rating × 70%)
        </td>
        <td
          colSpan={2}
          className="border border-black p-2 text-center font-bold text-base"
        >
          {part1}
        </td>
      </tr>

      <tr>
        <td colSpan={4} className="border border-black p-2 text-left">
          PART II RATING (Part II Rating × 30%)
        </td>
        <td
          colSpan={2}
          className="border border-black p-2 text-center font-bold text-base"
        >
          {part2}
        </td>
      </tr>

      <tr>
        <td
          colSpan={4}
          className="border border-black p-2 text-left font-semibold"
        >
          Total Overall Rating (Part I + Part II)
        </td>
        <td
          colSpan={2}
          className="border border-black p-2 text-center font-bold text-lg"
        >
          {totalRating}
        </td>
      </tr>

      <tr>
        <td
          colSpan={4}
          className="border border-black p-2 text-left font-semibold"
        >
          Adjectival Rating
        </td>
        <td
          colSpan={2}
          className="border border-black p-2 text-center font-bold text-lg"
        >
          {getAdjectival(totalRating)}
        </td>
      </tr>
    </>
  );
}

// components/IPCRForm/DiscussionAssessmentSection.jsx
export function DiscussionAssessmentSection() {
  return (
    <table className="w-full text-sm border-collapse border border-black mb-1">
      <tbody>
        <tr>
          <td className="border border-black p-1 text-left w-[22%]">
            Discussed with:
          </td>
          <td className="border border-black p-1 text-center w-[11.3%]">
            Date
          </td>
          <td className="border border-black p-1 text-center w-[22%]">
            Assessed by:
          </td>
          <td className="border border-black p-1 text-center w-[11.3%]">
            Date
          </td>
          <td className="border border-black p-1 text-center w-[22%]">
            Final Rating By:
          </td>
          <td className="border border-black p-1 text-center w-[11.3%]">
            Date
          </td>
        </tr>

        <tr>
          <td className="border border-black h-24 relative">
            <textarea className="w-full h-full absolute inset-0 resize-none outline-none p-2 bg-transparent" />
          </td>

          <td className="border border-black h-24 relative">
            <input
              type="text"
              className="w-full h-full absolute inset-0 text-center outline-none bg-transparent"
            />
          </td>

          <td className="border border-black h-24 relative text-center align-middle px-2">
            <div className="text-sm mb-6">
              I certify that I discussed my assessment of the performance with
              the employee.
            </div>
            <div className="font-bold text-xs">
              <input
                type="text"
                defaultValue="Dave Anthony A. Vergara, MD"
                className="w-full text-center font-bold outline-none bg-transparent text-[10px]"
              />
            </div>
          </td>

          <td className="border border-black h-24 relative">
            <input
              type="text"
              className="w-full h-full absolute inset-0 text-center outline-none bg-transparent"
            />
          </td>

          <td className="border border-black h-24 text-center align-bottom pb-1">
            <input
              type="text"
              defaultValue="Dave Anthony A. Vergara, MD"
              className="w-full text-center font-bold outline-none bg-transparent text-[10px]"
            />
          </td>

          <td className="border border-black h-24 relative">
            <input
              type="text"
              className="w-full h-full absolute inset-0 text-center outline-none bg-transparent"
            />
          </td>
        </tr>

        <tr>
          <td className="border border-black text-center text-xs pb-1">
            <input
              type="text"
              placeholder="Position"
              className="w-full text-center outline-none bg-transparent"
            />
          </td>

          <td className="border border-black bg-gray-50"></td>

          <td className="border border-black text-center text-xs pb-1">
            <input
              type="text"
              placeholder="Position"
              className="w-full text-center outline-none bg-transparent"
            />
          </td>

          <td className="border border-black bg-gray-50"></td>

          <td className="border border-black text-center text-xs pb-1">
            <input
              type="text"
              placeholder="Position"
              className="w-full text-center outline-none bg-transparent"
            />
          </td>

          <td className="border border-black bg-gray-50"></td>
        </tr>
      </tbody>
    </table>
  );
}

// components/IPCRForm/LegendSection.jsx
export function LegendSection() {
  return (
    <table className="w-full text-xs border-collapse border border-black mb-8">
      <tbody>
        <tr>
          <td className="border border-black p-1 pl-2 w-[15%] font-bold">
            Legend:
          </td>
          <td className="border border-black p-1 text-center w-[25%]">
            Q - Quality
          </td>
          <td className="border border-black p-1 text-center w-[25%]">
            E - Efficiency
          </td>
          <td className="border border-black p-1 text-center w-[20%]">
            T - Timeliness
          </td>
          <td className="border border-black p-1 text-center w-[15%]">
            A - Average
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EditableCell({ value, onChange }) {
  return (
    <td className="border border-black p-1 align-top">
      <textarea
        className="w-full h-full min-h-[60px] resize-none outline-none bg-transparent text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </td>
  );
}

export function RatingInputsCell({
  q,
  e,
  t,
  a,
  onQChange,
  onEChange,
  onTChange,
}) {
  const avg =
    q && e && t
      ? ((parseFloat(q) + parseFloat(e) + parseFloat(t)) / 3).toFixed(2)
      : "";

  const inputClass =
    "w-full text-center outline-none bg-transparent border-b border-gray-300 text-sm";

  return (
    <>
      <td className="border border-black p-1 text-center align-top">
        <input
          type="number"
          min={1}
          max={5}
          className={inputClass}
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />
      </td>
      <td className="border border-black p-1 text-center align-top">
        <input
          type="number"
          min={1}
          max={5}
          className={inputClass}
          value={e}
          onChange={(e) => onEChange(e.target.value)}
        />
      </td>
      <td className="border border-black p-1 text-center align-top">
        <input
          type="number"
          min={1}
          max={5}
          className={inputClass}
          value={t}
          onChange={(e) => onTChange(e.target.value)}
        />
      </td>
      <td className="border border-black p-1 text-center align-top text-sm font-semibold">
        {avg}
      </td>
    </>
  );
}

export function FunctionRowActionCell({ onDelete }) {
  return (
    <td className="border border-black p-1 text-center align-top">
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete row"
      >
        ✕
      </button>
    </td>
  );
}
