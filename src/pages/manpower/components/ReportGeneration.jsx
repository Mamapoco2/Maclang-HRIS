import { useState, useContext } from "react";
import { IconFileExport, IconLoader2 } from "@tabler/icons-react";
import XLSXStyle from "xlsx-js-style";
import api from "../../../api/api";
import { AuthContext } from "@/context/AuthContext";

// ── Employment type row colors ────────────────────────────────────────────────
const ROW_FILLS = {
  PLANTILLA: { fgColor: { rgb: "DBEAFE" } },
  "CONTRACT OF SERVICE": { fgColor: { rgb: "FEF3C7" } },
  COS: { fgColor: { rgb: "FEF3C7" } },
  CONTRACT: { fgColor: { rgb: "FEF3C7" } },
  CONSULTANT: { fgColor: { rgb: "EDE9FE" } },
};

function resolveRowFill(empType = "") {
  const upper = empType.toUpperCase();
  for (const [key, fill] of Object.entries(ROW_FILLS)) {
    if (upper.includes(key)) return fill;
  }
  return { fgColor: { rgb: "F9FAFB" } };
}

const COL_WIDTHS = {
  "EMPLOYEE NUMBER": 18,
  PREFIX: 8,
  "FIRST NAME": 18,
  "MIDDLE NAME": 18,
  "LAST NAME": 18,
  TITLE: 12,
  "ROLE POSITION": 24,
  DEPARTMENT: 28,
  DIVISION: 22,
  "POSITION TITLE": 26,
  "SALARY GRADE": 14,
  STEP: 8,
  "EMPLOYMENT TYPE": 20,
  "EMPLOYMENT STATUS": 20,
};

const titleStyle = {
  font: { bold: true, sz: 20, color: { rgb: "1E3A5F" }, name: "Arial" },
  alignment: { horizontal: "center", vertical: "center" },
  fill: { patternType: "solid", fgColor: { rgb: "DBEAFE" } },
  border: {
    top: { style: "medium", color: { rgb: "1E3A5F" } },
    bottom: { style: "medium", color: { rgb: "1E3A5F" } },
    left: { style: "medium", color: { rgb: "1E3A5F" } },
    right: { style: "medium", color: { rgb: "1E3A5F" } },
  },
};

const headerStyle = {
  font: { bold: true, sz: 10, color: { rgb: "FFFFFF" }, name: "Arial" },
  fill: { patternType: "solid", fgColor: { rgb: "1E3A5F" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "thin", color: { rgb: "93C5FD" } },
    bottom: { style: "thin", color: { rgb: "93C5FD" } },
    left: { style: "thin", color: { rgb: "93C5FD" } },
    right: { style: "thin", color: { rgb: "93C5FD" } },
  },
};

const dataStyle = (fgColor) => ({
  font: { sz: 9, color: { rgb: "111827" }, name: "Arial" },
  fill: { patternType: "solid", fgColor },
  alignment: { horizontal: "center", vertical: "center", wrapText: false },
  border: {
    top: { style: "hair", color: { rgb: "E5E7EB" } },
    bottom: { style: "hair", color: { rgb: "E5E7EB" } },
    left: { style: "hair", color: { rgb: "E5E7EB" } },
    right: { style: "hair", color: { rgb: "E5E7EB" } },
  },
});

export default function ReportGeneration({ department, division }) {
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useContext(AuthContext); // ✅

  // ✅ Don't render anything if user lacks manpower.manage
  if (!hasPermission("manpower.manage")) return null;

  const handleExport = async () => {
    try {
      setLoading(true);

      const res = await api.get("/manpower/report", {
        params: {
          department_id: department || "All",
          division_id: division || "All",
        },
      });

      const { title, report } = res.data;

      if (!report || report.length === 0) {
        alert("No data to export.");
        return;
      }

      const headers = Object.keys(report[0]);
      const wb = XLSXStyle.utils.book_new();
      const ws = {};

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      ];

      headers.forEach((_, ci) => {
        const addr = XLSXStyle.utils.encode_cell({ r: 0, c: ci });
        ws[addr] = { v: ci === 0 ? title : "", t: "s", s: titleStyle };
      });

      headers.forEach((h, ci) => {
        const addr = XLSXStyle.utils.encode_cell({ r: 1, c: ci });
        ws[addr] = { v: h, t: "s", s: headerStyle };
      });

      report.forEach((row, ri) => {
        const fill = resolveRowFill(row["EMPLOYMENT TYPE"] || "");
        headers.forEach((h, ci) => {
          const addr = XLSXStyle.utils.encode_cell({ r: ri + 2, c: ci });
          ws[addr] = { v: row[h] ?? "", t: "s", s: dataStyle(fill.fgColor) };
        });
      });

      ws["!ref"] = XLSXStyle.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: report.length + 1, c: headers.length - 1 },
      });

      ws["!cols"] = headers.map((h) => ({ wch: COL_WIDTHS[h] || 16 }));

      ws["!rows"] = [
        { hpt: 48 },
        { hpt: 28 },
        ...report.map(() => ({ hpt: 18 })),
      ];

      ws["!freeze"] = { xSplit: 0, ySplit: 2 };

      XLSXStyle.utils.book_append_sheet(wb, ws, "Employee Mapping");
      XLSXStyle.writeFile(wb, `${title}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md text-xs font-medium transition-colors"
    >
      {loading ? (
        <IconLoader2 size={14} className="animate-spin" />
      ) : (
        <IconFileExport size={14} />
      )}
      {loading ? "Exporting..." : "Export Report"}
    </button>
  );
}
