import { formatCurrency, formatDate } from "../utils";
import { formatPositionSlotNumbers } from "./postingHelpers";

function sanitizeCsvCell(value) {
  const str = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

const CSV_HEADERS = [
  "Item No.",
  "Position Slot Name",
  "Position Title",
  "Office",
  "Division",
  "Salary Grade",
  "Monthly Salary",
  "Employment Status",
  "Vacancies",
  "Date Posted",
  "Closing Date",
  "Applicants",
  "Status",
];

function toCsvRow(item) {
  return [
    item.baseItemNumber,
    formatPositionSlotNumbers(item),
    item.positionTitle,
    item.office,
    item.division,
    item.salaryGrade,
    item.monthlySalary,
    item.employmentStatus,
    item.vacantSlots ?? item.vacancies,
    item.datePosted,
    item.closingDate,
    item.applicants,
    item.status,
  ];
}

export function exportPostingsToCsv(
  postings,
  filename = "plantilla-postings.csv",
) {
  const rows = [CSV_HEADERS, ...postings.map(toCsvRow)];
  const csv = rows
    .map((r) =>
      r.map((c) => `"${sanitizeCsvCell(c).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
