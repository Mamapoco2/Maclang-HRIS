import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IPCRForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [employeeInfo, setEmployeeInfo] = useState({
    name: "",
    position: "",
    unit: "",
    department: "Rosario Maclang Bautista General Hospital",
    period: "January to June 2026",
  });

  const [coreFunctions, setCoreFunctions] = useState([
    {
      id: "c1",
      output: "",
      indicators: "",
      accomplishments: "",
      q: "",
      e: "",
      t: "",
      a: "",
      remarks: "",
    },
    {
      id: "c2",
      output: "",
      indicators: "",
      accomplishments: "",
      q: "",
      e: "",
      t: "",
      a: "",
      remarks: "",
    },
    {
      id: "c3",
      output: "",
      indicators: "",
      accomplishments: "",
      q: "",
      e: "",
      t: "",
      a: "",
      remarks: "",
    },
  ]);

  const [supportFunctions, setSupportFunctions] = useState([
    {
      id: "s1",
      output: "",
      indicators: "",
      accomplishments: "",
      q: "",
      e: "",
      t: "",
      a: "",
      remarks: "",
    },
    {
      id: "s2",
      output: "",
      indicators: "",
      accomplishments: "",
      q: "",
      e: "",
      t: "",
      a: "",
      remarks: "",
    },
  ]);

  /* ================= LOAD DATA IF EDIT ================= */

  useEffect(() => {
    if (isEdit) {
      console.log("Load IPCR:", id);
      // TODO: load data from API
    }
  }, [id]);

  /* ================= HELPERS ================= */

  const toNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const computeAverage = (q, e, t) => {
    const values = [toNumber(q), toNumber(e), toNumber(t)].filter(
      (v) => v !== null,
    );

    if (values.length === 0) return "";

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(2);
  };

  /* ================= ROW UPDATE ================= */

  const updateRowWithComputation = (type, id, field, value) => {
    const setter = type === "core" ? setCoreFunctions : setSupportFunctions;

    setter((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        updated.a = computeAverage(updated.q, updated.e, updated.t);

        return updated;
      }),
    );
  };

  const updateRow = (type, id, field, value) => {
    const setter = type === "core" ? setCoreFunctions : setSupportFunctions;

    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = (type) => {
    const newRow = {
      id: Math.random().toString(36).substr(2, 9),
      output: "",
      indicators: "",
      accomplishments: "",
      q: "",
      e: "",
      t: "",
      a: "",
      remarks: "",
    };

    if (type === "core") {
      setCoreFunctions([...coreFunctions, newRow]);
    } else {
      setSupportFunctions([...supportFunctions, newRow]);
    }
  };

  const removeRow = (type, id) => {
    const setter = type === "core" ? setCoreFunctions : setSupportFunctions;
    setter((prev) => prev.filter((row) => row.id !== id));
  };

  /* ================= PART COMPUTATION ================= */

  const coreValid = coreFunctions
    .map((r) => toNumber(r.a))
    .filter((v) => v !== null);

  const supportValid = supportFunctions
    .map((r) => toNumber(r.a))
    .filter((v) => v !== null);

  const coreAverage =
    coreValid.length > 0
      ? coreValid.reduce((a, b) => a + b, 0) / coreValid.length
      : 0;

  const supportAverage =
    supportValid.length > 0
      ? supportValid.reduce((a, b) => a + b, 0) / supportValid.length
      : 0;

  const part1 = (coreAverage * 0.7).toFixed(2);
  const part2 = (supportAverage * 0.3).toFixed(2);

  const totalRating = (coreAverage * 0.7 + supportAverage * 0.3).toFixed(2);

  const getAdjectival = (score) => {
    const s = parseFloat(score);
    if (s === 0) return "";
    if (s >= 4.5) return "Outstanding";
    if (s >= 3.5) return "Very Satisfactory";
    if (s >= 2.5) return "Satisfactory";
    if (s >= 1.5) return "Unsatisfactory";
    return "Poor";
  };

  /* ================= SAVE / UPDATE ================= */

  const handleSubmit = () => {
    const payload = {
      employeeInfo,
      coreFunctions,
      supportFunctions,
      totalRating,
    };

    if (isEdit) {
      console.log("Updating IPCR", payload);
      // update API
    } else {
      console.log("Creating IPCR", payload);
      // create API
    }

    navigate("/spms/ipcr");
  };

  /* ================= UI COMPONENT ================= */

  const EditableCell = ({
    value,
    onChange,
    className = "",
    align = "justify",
  }) => (
    <td className={`border border-black align-middle ${className}`}>
      <textarea
        className={`w-full min-h-[50px] bg-transparent outline-none resize-none text-sm p-2 leading-snug ${
          align === "center" ? "text-center" : "text-justify"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </td>
  );

  return (
    <>
      <style>
        {`
@media print {

  @page {
    size: Legal portrait;
    margin: 5mm;
  }

  body {
    margin: 0;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body * {
    visibility: hidden;
  }

  .print-container,
  .print-container * {
    visibility: visible;
  }

  .print-container {
    position: relative;     /* 🔥 CHANGE THIS */
   width: 8.5in; /* 🔥 CHANGE THIS */
    margin: 0 ;
    padding: 0;
    background: white !important;
  }

  .overflow-x-auto {
    overflow: visible !important;
  }

tr {
  page-break-inside: avoid;
}

table {
  page-break-inside: auto;
}

  textarea,
  input {
    border: none !important;
    outline: none !important;
    resize: none !important;
    overflow: hidden !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    background: transparent !important;
  }

  
}

}
`}
      </style>

      <div className="min-h-screen bg-gray-100 py-8 px-4 font-serif text-black selection:bg-blue-200 selection:text-black">
        <div className=" bg-white p-8 md:p-12 print-container">
          {/* TITLE */}

          <div className="text-center font-bold mb-6">
            <h1 className="text-xl tracking-wide">
              {isEdit
                ? "EDIT INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)"
                : "CREATE INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)"}
            </h1>
          </div>
          <div className="text-center font-bold mb-6">
            <h1 className="text-xl tracking-wide">
              INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)
            </h1>
          </div>

          <div className="text-sm mb-8 leading-relaxed text-justify">
            I,{" "}
            <input
              className="font-bold border-b border-black outline-none inline-block min-w-[200px] bg-transparent px-1"
              value={employeeInfo.name}
              onChange={(e) =>
                setEmployeeInfo({ ...employeeInfo, name: e.target.value })
              }
            />
            ,{" "}
            <input
              className="font-bold border-b border-black outline-none inline-block min-w-[200px] bg-transparent px-1"
              value={employeeInfo.position}
              onChange={(e) =>
                setEmployeeInfo({ ...employeeInfo, position: e.target.value })
              }
            />
            , of the{" "}
            <input
              className="font-bold border-b border-black outline-none inline-block min-w-[200px] bg-transparent px-1"
              value={employeeInfo.unit}
              onChange={(e) =>
                setEmployeeInfo({ ...employeeInfo, unit: e.target.value })
              }
            />{" "}
            of{" "}
            <input
              className="font-bold border-b border-black outline-none inline-block min-w-[350px] bg-transparent px-1"
              value={employeeInfo.department}
              onChange={(e) =>
                setEmployeeInfo({ ...employeeInfo, department: e.target.value })
              }
            />{" "}
            commit to deliver and agree to be rated on the attainment of the
            following targets in accordance with the indicated measures for the
            period{" "}
            <input
              className="font-bold border-b border-black outline-none inline-block min-w-[150px] bg-transparent px-1"
              value={employeeInfo.period}
              onChange={(e) =>
                setEmployeeInfo({ ...employeeInfo, period: e.target.value })
              }
            />
            .
          </div>

          <div className="flex justify-between items-end mb-6 text-sm">
            <div className="w-1/3 text-center mt-10">
              <input
                type="text"
                placeholder="Employee Name"
                className="w-full text-center font-bold outline-none bg-transparent"
              />
              <div className="border-t border-black pt-1">
                Signature of Employee
              </div>
            </div>

            <div className="w-1/4 text-center mt-10">
              <input
                type="text"
                placeholder="Date"
                className="w-full text-center  font-bold outline-none bg-transparent"
              />
              <div className="border-t border-black pt-1 ">Date</div>
            </div>
          </div>

          <table className="w-full text-sm border-collapse border border-black mb-6">
            <tbody>
              <tr>
                <td className="border border-black p-1 text-center w-1/3">
                  Reviewed by:
                </td>
                <td className="border border-black p-1 text-center w-1/6">
                  Date
                </td>
                <td className="border border-black p-1 text-center w-1/3">
                  Approved by:
                </td>
                <td className="border border-black p-1 text-center w-1/6">
                  Date
                </td>
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
                  Satisfactory &nbsp;&nbsp;&nbsp; 3 Satisfactory
                  &nbsp;&nbsp;&nbsp; 2 - Unsatisfactory &nbsp;&nbsp;&nbsp; 1 -
                  Poor
                </td>
              </tr>
            </tbody>
          </table>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-black mb-6 min-w-[800px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 w-[20%]">Output</th>
                  <th className="border border-black p-2 w-[25%]">
                    Success Indicators
                    <br />
                    <span className="font-normal text-xs">
                      (Targets + Measures)
                    </span>
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
                <tr>
                  <td
                    colSpan={5}
                    className="border border-black p-1 font-bold bg-gray-50 text-left"
                  >
                    Core Function
                  </td>
                  <td className="border-b border-t border-black w-8 print:hidden bg-white"></td>
                </tr>
                {coreFunctions.map((row) => (
                  <tr key={row.id} className="group relative">
                    <EditableCell
                      value={row.output}
                      onChange={(v) => updateRow("core", row.id, "output", v)}
                    />
                    <EditableCell
                      value={row.indicators}
                      onChange={(v) =>
                        updateRow("core", row.id, "indicators", v)
                      }
                    />
                    <EditableCell
                      value={row.accomplishments}
                      onChange={(v) =>
                        updateRow("core", row.id, "accomplishments", v)
                      }
                    />
                    <td className="border border-black p-0">
                      <div className="flex h-full divide-x divide-black">
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent"
                          value={row.q}
                          onChange={(e) =>
                            updateRowWithComputation(
                              "core",
                              row.id,
                              "q",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent"
                          value={row.e}
                          onChange={(e) =>
                            updateRowWithComputation(
                              "core",
                              row.id,
                              "e",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent"
                          value={row.t}
                          onChange={(e) =>
                            updateRowWithComputation(
                              "core",
                              row.id,
                              "t",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent font-bold"
                          value={row.a}
                          readOnly
                        />
                      </div>
                    </td>
                    <EditableCell
                      value={row.remarks}
                      onChange={(v) => updateRow("core", row.id, "remarks", v)}
                    />
                    <td className="p-0 border-r border-black w-8 print:hidden text-center opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                      <button
                        onClick={() => removeRow("core", row.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="print:hidden border border-black border-l-0 border-r-0">
                  <td colSpan={6} className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addRow("core")}
                      className="w-full border-dashed border-2"
                    >
                      <Plus size={14} className="mr-2" /> Add Core Function Row
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td
                    colSpan={5}
                    className="border border-black p-1 font-bold bg-gray-50 text-left"
                  >
                    Support Function
                  </td>
                  <td className="border-b border-t border-black w-8 print:hidden bg-white"></td>
                </tr>
                {supportFunctions.map((row) => (
                  <tr key={row.id} className="group relative">
                    <EditableCell
                      value={row.output}
                      onChange={(v) =>
                        updateRow("support", row.id, "output", v)
                      }
                    />
                    <EditableCell
                      value={row.indicators}
                      onChange={(v) =>
                        updateRow("support", row.id, "indicators", v)
                      }
                    />
                    <EditableCell
                      value={row.accomplishments}
                      onChange={(v) =>
                        updateRow("support", row.id, "accomplishments", v)
                      }
                    />
                    <td className="border border-black p-0">
                      <div className="flex h-full divide-x divide-black">
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent"
                          value={row.q}
                          onChange={(e) =>
                            updateRowWithComputation(
                              "support",
                              row.id,
                              "q",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent"
                          value={row.e}
                          onChange={(e) =>
                            updateRowWithComputation(
                              "support",
                              row.id,
                              "e",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent"
                          value={row.t}
                          onChange={(e) =>
                            updateRowWithComputation(
                              "support",
                              row.id,
                              "t",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="w-1/4 min-h-[40px] text-center outline-none bg-transparent font-bold"
                          value={row.a}
                          readOnly
                        />
                      </div>
                    </td>
                    <EditableCell
                      value={row.remarks}
                      onChange={(v) =>
                        updateRow("support", row.id, "remarks", v)
                      }
                    />
                    <td className="p-0 border-r border-black w-8 print:hidden text-center opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                      <button
                        onClick={() => removeRow("support", row.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="print:hidden border border-black border-l-0 border-r-0">
                  <td colSpan={6} className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addRow("support")}
                      className="w-full border-dashed border-2"
                    >
                      <Plus size={14} className="mr-2" /> Add Support Function
                      Row
                    </Button>
                  </td>
                </tr>

                {/* ===================== RATING SUMMARY ===================== */}
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
              </tbody>
            </table>
          </div>

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
                    I certify that I discussed my assessment of the performance
                    with the employee.
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

          <div className="flex justify-center gap-3 print:hidden mt-8">
            <Button onClick={handleSubmit}>
              {isEdit ? "Update IPCR" : "Save IPCR"}
            </Button>

            <Button variant="outline" onClick={() => navigate("/spms/ipcr")}>
              Back
            </Button>

            <Button onClick={() => window.print()}>Print / Save as PDF</Button>
          </div>
        </div>
      </div>
    </>
  );
}
