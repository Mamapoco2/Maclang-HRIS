import * as XLSX from "xlsx-js-style";

export default function ReportGeneration({ data }) {
  const generateExcel = () => {
    if (!data || data.length === 0) return;

    /* ---------------- NAME RESOLVER ---------------- */
    const resolveNameFields = (d = {}) => {
      return {
        prefix: d.prefix || "",
        firstname: d.firstName || "",
        middlename: d.middleName || "",
        middleinitial: d.middleInitial || "",
        lastname: d.lastName || "",
        suffix: d.suffix || "", // <-- included suffix
        postTitle: d.postTitle || "",
      };
    };

    /* ---------------- FLATTEN TREE ---------------- */
    const flattenTree = (nodes) => {
      let rows = [];

      nodes.forEach((node) => {
        const d = node.data || {};
        const name = resolveNameFields(d);

        const isVacant =
          !name.firstname &&
          !name.lastname &&
          (!d.name || d.name.toLowerCase() === "vacant");

        rows.push({
          department: d.department || "",
          deployment: d.deployment || "",
          plantillaItem: d.plantillaItem || "",
          prefix: name.prefix,
          firstname: name.firstname,
          middlename: name.middlename,
          middleinitial: name.middleinitial,
          lastname: name.lastname,
          suffix: name.suffix, // <-- added suffix
          postTitle: name.postTitle,
          role: d.role || "",
          employeeId: d.employeeId || "",
          employmentType: d.employmentType || "",
          status: isVacant ? "Vacant" : "Filled",
        });

        if (node.children?.length) {
          rows = rows.concat(flattenTree(node.children));
        }
      });

      return rows;
    };

    const rows = flattenTree(data);

    /* ---------------- HEADERS ---------------- */
    const headers = [
      "DEPARTMENT",
      "DEPLOYMENT",
      "PLANTILLA ITEM",
      "PREFIX",
      "FIRST NAME",
      "MIDDLE NAME",
      "MIDDLE INITIAL",
      "LAST NAME",
      "SUFFIX", // <-- suffix column
      "POST TITLE",
      "ROLE",
      "EMPLOYEE ID",
      "EMPLOYMENT TYPE",
      "STATUS",
    ];

    /* ---------------- CALCULATE PLANTILLA COUNT ---------------- */
    const plantillaCount = {};
    headers.forEach((header) => {
      if (header === "PLANTILLA ITEM" || header === "EMPLOYMENT TYPE") {
        plantillaCount[header] = rows.filter(
          (r) => r.employmentType?.toLowerCase() === "plantilla",
        ).length;
      } else {
        plantillaCount[header] = rows.length;
      }
    });

    /* ---------------- WORKSHEET DATA ---------------- */
    const worksheetData = [
      headers.map((h) => `${h} (Plantilla: ${plantillaCount[h] || 0})`),
      ...rows.map((r) => [
        r.department,
        r.deployment,
        r.plantillaItem,
        r.prefix,
        r.firstname,
        r.middlename,
        r.middleinitial,
        r.lastname,
        r.suffix, // <-- include suffix in data row
        r.postTitle,
        r.role,
        r.employeeId,
        r.employmentType,
        r.status,
      ]),
    ];

    /* ---------------- CREATE WORKSHEET ---------------- */
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    /* ---------------- HEADER STYLE ---------------- */
    headers.forEach((_, colIndex) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4CAF50" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    /* ---------------- AUTO WIDTH ---------------- */
    worksheet["!cols"] = headers.map((_, colIndex) => {
      const maxLength = Math.max(
        headers[colIndex].length +
          ` (Plantilla: ${plantillaCount[headers[colIndex]] || 0})`.length,
        ...worksheetData
          .slice(1)
          .map((row) => (row[colIndex] ? row[colIndex].toString().length : 0)),
      );

      return { wch: Math.min(maxLength + 2, 50) };
    });

    /* ---------------- EXPORT ---------------- */
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Manpower");
    XLSX.writeFile(workbook, "manpower-report.xlsx");
  };

  return (
    <button
      onClick={generateExcel}
      className="bg-green-600! text-white! hover:bg-green-700! px-4 py-2 rounded-md transition text-sm font-medium"
    >
      Generate Report
    </button>
  );
}
