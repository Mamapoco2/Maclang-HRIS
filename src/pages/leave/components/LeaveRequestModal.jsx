// src/pages/leave/components/LeaveRequestModal.jsx
//
// Opens a leave request as a CS Form 6 replica in a modal, from
// e.g. a table row's "View" action. Styled to match RequestsPage's
// design tokens (--card, --border, --foreground, --muted-foreground).
//
// USAGE (inside RequestsPage.jsx)
//   const [viewTarget, setViewTarget] = useState(null);
//   ...
//   <button onClick={() => setViewTarget(row.original)} title="View">
//     <Eye className="w-4 h-4" />
//   </button>
//   ...
//   {viewTarget && (
//     <LeaveRequestModal
//       request={viewTarget}
//       onClose={() => setViewTarget(null)}
//     />
//   )}

import { useEffect, useCallback } from "react";
import { X, Printer } from "lucide-react";
import LeaveRequestDocument from "./LeaveRequestDocument";
import LeaveRequestDocumentCOS from "./LeaveRequestDocumentCOS";

// COS / Job Order / Consultant / Contractual staff use the simplified
// "Application for Leave (for Consultant and Contractual)" form instead
// of CS Form 6, which is reserved for regular (plantilla) employees.
// COS / Job Order / Consultant / Contractual staff use the simplified
// "Application for Leave (for Consultant and Contractual)" form instead
// of CS Form 6, which is reserved for regular (plantilla) employees.
const COS_KEYWORDS = [
  "contract of service",
  "cos",
  "job order",
  "consultant",
  "contractual",
];

const EMPLOYMENT_TYPE_KEYS = [
  "employment_type",
  "employmentType",
  "appointment_type",
  "appointmentType",
  "appointment_status",
  "appointmentStatus",
  "nature_of_appointment",
  "natureOfAppointment",
  "personnel_type",
  "personnelType",
  "employee_type",
  "employeeType",
  "staff_type",
  "staffType",
  "contract_type",
  "contractType",
  "type_of_employment",
  "typeOfEmployment",
];

function readEmploymentTypeField(obj) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of EMPLOYMENT_TYPE_KEYS) {
    if (obj[key]) return obj[key];
  }
  return undefined;
}

function isCosOrConsultant(request) {
  const candidates = [
    readEmploymentTypeField(request),
    readEmploymentTypeField(request?.employee),
    readEmploymentTypeField(request?.personnel),
    readEmploymentTypeField(request?.staff),
  ].filter(Boolean);

  const nested = request?.employee ?? request?.personnel ?? request?.staff;
  if (nested && typeof nested === "object") {
    Object.values(nested).forEach((v) => {
      if (typeof v === "string") candidates.push(v);
      if (Array.isArray(v))
        v.forEach((x) => typeof x === "string" && candidates.push(x));
    });
  }

  const match = candidates.find((raw) => {
    const value = String(raw).toLowerCase().trim();
    return value && COS_KEYWORDS.some((k) => value.includes(k));
  });

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug(
      "[LeaveRequestModal] employment type candidates:",
      candidates,
      "-> matched:",
      match ?? "(none — showing CS Form 6)",
    );
  }

  return Boolean(match);
}

export function LeaveRequestModal({ request, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!request) return null;

  const handlePrint = () => window.print();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in print:static print:block print:bg-transparent print:p-0"
      role="dialog"
      aria-modal="true"
      aria-label="Leave request details"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-xl bg-[var(--card)] shadow-2xl print:static print:block print:max-h-none print:w-full print:max-w-none print:overflow-visible print:rounded-none print:bg-transparent print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3 print:hidden">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Leave Request
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="flex flex-1 min-h-0 justify-center overflow-y-auto bg-[var(--muted)]/30 p-4 print:static print:block print:h-auto print:min-h-0 print:overflow-visible print:bg-transparent print:p-0"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          {isCosOrConsultant(request) ? (
            <LeaveRequestDocumentCOS
              leaveRequest={request}
              printAreaId="csform6cos-modal-print-area"
            />
          ) : (
            <LeaveRequestDocument
              leaveRequest={request}
              printAreaId="csform6-modal-print-area"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveRequestModal;
