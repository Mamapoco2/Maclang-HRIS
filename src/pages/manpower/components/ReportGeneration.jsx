import * as XLSX from "xlsx-js-style";

export default function ReportGeneration({ data }) {
  const generateExcel = () => {
    if (!data || data.length === 0) return;

    // Helper function to parse full name
    const parseName = (fullName) => {
      if (!fullName) return { prefix: "", firstname: "", middlename: "", lastname: "", suffix: "", postTitle: "" };

      // Define common prefixes and suffixes
      const prefixes = ["Mr", "Ms", "Mrs", "Dr", "Engr", "Prof", "Sir", "Madam"];
      const suffixes = ["Jr", "Sr", "II", "III", "IV", "MD", "DMD", "PhD", "RN"];

      let nameParts = fullName.trim().split(/\s+/);

      let prefix = "";
      let suffix = "";
      let postTitle = "";

      // Check for prefix
      if (prefixes.some((p) => nameParts[0].replace(".", "").toLowerCase() === p.toLowerCase())) {
        prefix = nameParts.shift();
      }

      // Check for suffix or postTitle at the end
      const lastPart = nameParts[nameParts.length - 1];
      if (suffixes.some((s) => lastPart.replace(".", "").toUpperCase() === s.toUpperCase())) {
        // Decide if it's a suffix or postTitle
        if (["MD", "DMD", "PhD", "RN"].includes(lastPart.toUpperCase())) {
          postTitle = lastPart;
        } else {
          suffix = lastPart;
        }
        nameParts.pop();
      }

      let firstname = nameParts[0] || "";
      let middlename = "";
      let lastname = "";

      if (nameParts.length === 2) {
        lastname = nameParts[1];
      } else if (nameParts.length >= 3) {
        middlename = nameParts[1][0]; // just initial
        lastname = nameParts.slice(2).join(" ");
      }

      return { prefix, firstname, middlename, lastname, suffix, postTitle };
    };

    // Flatten the tree into rows
    const flattenTree = (nodes) => {
      let rows = [];
      nodes.forEach((node) => {
        const d = node.data || {};
        const isVacant =
          !d.name ||
          d.name.toLowerCase() === "vacant" ||
          d.role?.toLowerCase() === "vacant";

        const parsedName = parseName(d.name);

        rows.push({
          motherUnit: d.motherUnit || "",
          prefix: parsedName.prefix,
          firstname: parsedName.firstname,
          middlename: parsedName.middlename,
          lastname: parsedName.lastname,
          suffix: parsedName.suffix,
          postTitle: parsedName.postTitle,
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

    const headers = [
      "MOTHER UNIT",
      "PREFIX",
      "FIRSTNAME",
      "MIDDLENAME",
      "LASTNAME",
      "SUFFIX",
      "POST TITLE",
      "ROLE",
      "EMPLOYEE ID",
      "EMPLOYMENT TYPE",
      "STATUS",
    ];

    const worksheetData = [
      headers,
      ...rows.map((row) => [
        row.motherUnit,
        row.prefix,
        row.firstname,
        row.middlename,
        row.lastname,
        row.suffix,
        row.postTitle,
        row.role,
        row.employeeId,
        row.employmentType,
        row.status,
      ]),
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Style header row
    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
        };
      }
    });

    // Auto column width
    worksheet["!cols"] = headers.map((_, colIndex) => {
      const maxLength = Math.max(
        headers[colIndex].length,
        ...worksheetData
          .slice(1)
          .map((row) => (row[colIndex] ? row[colIndex].toString().length : 0))
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });

    // Create workbook and save file
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Manpower");
    XLSX.writeFile(workbook, "manpower-report.xlsx");
  };

  return (
    <button
      onClick={generateExcel}
      className="!bg-green-600 !text-white hover:!bg-green-700 px-4 py-2 rounded-md transition text-sm font-medium"
    >
      Generate Report
    </button>
  );
}
