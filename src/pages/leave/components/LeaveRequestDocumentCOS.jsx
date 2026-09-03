// src/pages/leave/LeaveRequestDocumentCOS.jsx
//
// Printable "APPLICATION FOR LEAVE (for Consultant and Contractual)"
// document — the COS/Consultant counterpart of CS Form 6. Same data
// shape as LeaveRequestDocument (normalizeLeaveRequest), different,
// simpler layout that mirrors the agency's paper form.
//
// USAGE
//   <LeaveRequestDocumentCOS leaveRequest={record} />

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { normalizeLeaveRequest } from "./LeaveRequestDocument";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateParts(value) {
  if (!value) return { mm: "", dd: "", yyyy: "" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { mm: "", dd: "", yyyy: "" };
  return {
    mm: String(d.getMonth() + 1).padStart(2, "0"),
    dd: String(d.getDate()).padStart(2, "0"),
    yyyy: String(d.getFullYear()),
  };
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fullName(lr) {
  return [lr.lastName, lr.firstName, lr.middleName].filter(Boolean).join(", ");
}

function Checkbox({ checked, children }) {
  return (
    <div className="flex items-start gap-1.5 py-0.5">
      <span
        aria-hidden="true"
        className={`csform6cos-box mt-0.5 inline-flex size-3.5 shrink-0 items-center justify-center border-2 border-black text-[10px] leading-none ${
          checked ? "bg-black text-white" : "bg-white"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span className="text-[11px] leading-tight">{children}</span>
    </div>
  );
}

// Plain (checkbox-less) line item, used under 6.d) where the paper form
// does not print a checkbox square — just the label and an underline.
function PlainItem({ children }) {
  return <div className="py-0.5 text-[11px] leading-tight">{children}</div>;
}

function DatePartCell({ value }) {
  return (
    <td className="border-2 border-black p-1 text-center text-[10px]">
      {value || "\u00A0"}
    </td>
  );
}

function FormBody({ lr, details, hasRecommendation, hasAction }) {
  const COS_LEAVE_TYPES = ["vacation", "sick", "maternity", "paternity"];
  const isOthers = !COS_LEAVE_TYPES.includes(lr.leaveType);
  const from = formatDateParts(lr.inclusiveDatesFrom);
  const to = formatDateParts(lr.inclusiveDatesTo);

  return (
    <div className="csform6cos-serif">
      <style>{`
        .csform6cos-serif,
        .csform6cos-serif * {
          font-family: "Times New Roman", Times, serif !important;
        }
      `}</style>
      <header className="mb-2 flex items-start justify-end text-[9px]">
        <div className="text-right">OCG-OP-CPO Form No. 15</div>
      </header>

      <h1 className="text-center text-xl font-bold tracking-wide">
        APPLICATION FOR LEAVE
      </h1>
      <div className="mb-3 text-center text-[21px]">
        (for Consultant and Contractual)
      </div>
      {/* 1–5 — bordered box starts here; header/title above stays unboxed */}
      <div className="text-[11px] pt-5">
        <table className="w-full border-collapse text-[11px]">
          <tbody>
            <tr>
              <td className="w-1/4 border-2 border-black p-1.5 align-top">
                <div className="text-[10px] font-semibold">1. OFFICE</div>
                <div className="mt-3 text-[11px]">
                  {`${lr.office || ""}`.trim() || "\u00A0"}
                </div>
              </td>
              <td className="border-2 border-black p-1.5 align-top">
                <div className="text-[10px] font-semibold">
                  2. a) NAME{" "}
                  <span className="text-[9px] font-normal italic">(Last)</span>
                </div>
                <div className="mt-3 text-center text-[11px]">
                  {lr.lastName || "\u00A0"}
                </div>
              </td>
              <td className="border-2 border-black p-1.5 align-top">
                <div className="text-[9px] font-normal italic">(First)</div>
                <div className="mt-3 text-center text-[11px]">
                  {lr.firstName || "\u00A0"}
                </div>
              </td>
              <td className="border-2 border-black p-1.5 align-top">
                <div className="text-[9px] font-normal italic">(Middle)</div>
                <div className="mt-3 text-center text-[11px]">
                  {lr.middleName || "\u00A0"}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-2 border-black p-1.5 align-top">
                <div className="text-[10px] font-semibold">
                  3. DATE OF FILING
                </div>
                <div className="mt-3 text-[11px]">
                  {formatDate(lr.dateFiled) || "\u00A0"}
                </div>
              </td>
              <td className="border-2 border-black p-1.5 align-top" colSpan={2}>
                <div className="text-[10px] font-semibold">4. POSITION</div>
                <div className="mt-3 text-[11px]">
                  {lr.position || "\u00A0"}
                </div>
              </td>
              <td className="border-2 border-black p-1.5 align-top">
                <div className="text-[10px] font-semibold">
                  5. SALARY (Monthly)
                </div>
                <div className="mt-3 text-[11px]">
                  {formatCurrency(lr.salary) || "\u00A0"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="border-b-2 border-l-2 border-r-2 border-black">
          <div className="border-b-2 border-black text-center">
            <div className="inline-block py-2 text-[11px] font-bold leading-none">
              DETAILS OF APPLICATION
            </div>
          </div>

          {/* 6.a/6.b/6.c  |  6.d */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            <div className="border-r-2 border-black p-2">
              <div className="mb-1 text-[10px] font-bold">
                6. a) TYPE OF LEAVE
              </div>
              <Checkbox checked={lr.leaveType === "vacation"}>
                Vacation
              </Checkbox>
              <Checkbox checked={isOthers}>Others (Specify)</Checkbox>
              <div className="ml-5 space-y-2 pb-1">
                <div className="border-b-2 border-black text-[11px]">
                  {isOthers ? lr.othersSpecify || "\u00A0" : "\u00A0"}
                </div>
                <div className="border-b-2 border-black text-[11px]">
                  &nbsp;
                </div>
              </div>
              <Checkbox checked={lr.leaveType === "sick"}>Sick</Checkbox>
              <Checkbox checked={lr.leaveType === "maternity"}>
                Maternity
              </Checkbox>
              <Checkbox checked={lr.leaveType === "paternity"}>
                Paternity
              </Checkbox>

              <div className="mt-4 mb-1 flex flex-wrap items-baseline gap-1 text-[10px] font-bold">
                <span>6. b) NUMBER OF WORKING DAYS</span>
                <span className="flex flex-1 items-baseline gap-1 pl-4">
                  APPLIED FOR
                  <span className="flex-1 border-b-2 border-black px-1 text-center text-[11px] font-normal">
                    {lr.numberOfDays ?? "\u00A0"}
                  </span>
                </span>
              </div>

              <div className="mb-1 mt-3 text-[10px] font-bold">
                6. c) INCLUSIVE DATES:
              </div>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr>
                    <th
                      className="border-2 border-black p-1 font-semibold"
                      colSpan={3}
                    >
                      FROM
                    </th>
                    <th
                      className="border-2 border-black p-1 font-semibold"
                      colSpan={3}
                    >
                      TO
                    </th>
                  </tr>
                  <tr>
                    <th className="border-2 border-black p-1 font-normal">
                      MM
                    </th>
                    <th className="border-2 border-black p-1 font-normal">
                      DD
                    </th>
                    <th className="border-2 border-black p-1 font-normal">
                      YYYY
                    </th>
                    <th className="border-2 border-black p-1 font-normal">
                      MM
                    </th>
                    <th className="border-2 border-black p-1 font-normal">
                      DD
                    </th>
                    <th className="border-2 border-black p-1 font-normal">
                      YYYY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <DatePartCell value={from.mm} />
                    <DatePartCell value={from.dd} />
                    <DatePartCell value={from.yyyy} />
                    <DatePartCell value={to.mm} />
                    <DatePartCell value={to.dd} />
                    <DatePartCell value={to.yyyy} />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between p-2 text-[11px]">
              <div>
                <div className="mb-1 text-[10px] font-bold">
                  6. d) WHERE LEAVE WILL BE SPENT
                </div>

                <div className="mb-3">
                  <div className="text-center font-semibold">
                    1. IN CASE OF VACATION LEAVE
                  </div>
                  <PlainItem>Within the Philippines</PlainItem>
                  <PlainItem>
                    Abroad (specify){" "}
                    <span className="border-b-2 border-black pb-0.5">
                      {details.vacationLocation === "abroad"
                        ? details.abroadSpecify
                        : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                    </span>
                  </PlainItem>
                </div>

                <div>
                  <div className="text-center font-semibold">
                    1. IN CASE OF SICK LEAVE
                  </div>
                  <PlainItem>
                    In Hospital (specify){" "}
                    <span className="border-b-2 border-black pb-0.5">
                      {details.sickType === "hospital"
                        ? details.illness
                        : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                    </span>
                  </PlainItem>
                  <PlainItem>
                    Out Patient (specify){" "}
                    <span className="border-b-2 border-black pb-0.5">
                      {details.sickType === "outpatient"
                        ? details.illness
                        : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                    </span>
                  </PlainItem>
                </div>
              </div>

              <div className="mt-6 border-t-2 border-black pt-1 text-center text-[9px]">
                {fullName(lr) || "\u00A0"}
                <br />
                (Signature of Applicant)
              </div>
            </div>
          </div>

          <div className="border-b-2 border-black text-center">
            <div className="inline-block py-2 text-[11px] font-bold leading-none">
              DETAILS OF ACTION ON APPLICATION
            </div>
          </div>

          {/* 7.a / 7.b */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            <div className="border-r-2 border-black p-2 text-[11px]">
              <div className="mb-1 text-[10px] font-bold">
                7. a) CERTIFICATION:
              </div>
              <div className="italic">For documentation purposes only.</div>
            </div>

            <div className="p-2 text-[11px]">
              <div className="mb-1 text-[10px] font-bold">
                7. b) RECOMMENDATION
              </div>
              <PlainItem>Approved</PlainItem>
              <PlainItem>
                Disapproved due to{" "}
                <span className="border-b-2 border-black pb-0.5">
                  {hasRecommendation &&
                  lr.recommendation.decision === "disapproval"
                    ? lr.recommendation.disapprovalReason
                    : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                </span>
              </PlainItem>
            </div>
          </div>

          {/* 7.c */}
          <div className="p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">
              7. c) APPROVED FOR:
            </div>
            <div className="min-h-[110px]">
              {hasAction ? lr.action.approvedForText : ""}
            </div>
            <div className="flex flex-col items-center pb-2">
              {hasAction && lr.action.signatureUrl ? (
                <img
                  src={lr.action.signatureUrl}
                  alt={`Signature of ${lr.action.officialName ?? "authorized official"}`}
                  className="csform6cos-signature h-10 max-w-[160px] object-contain"
                />
              ) : (
                <div className="h-10" />
              )}
              <div className="w-72 border-t-2 border-black pt-1 text-center text-[10px]">
                {hasAction ? (lr.action.officialName ?? "\u00A0") : "\u00A0"}
              </div>
              <div className="text-center text-[9px]">
                Signature
                <br />
                (Authorized Official)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaveRequestDocumentCOS({
  leaveRequest,
  printAreaId = "csform6cos-print-area",
}) {
  const lr = normalizeLeaveRequest(leaveRequest);
  const details = lr.details ?? {};
  const hasRecommendation = Boolean(lr.recommendation);
  const hasAction = Boolean(lr.action);

  const portalRootId = `${printAreaId}-portal-root`;

  const PRINT_MARGIN_VERTICAL_MM = 10;
  const PRINT_MARGIN_HORIZONTAL_MM = 12;
  const printRef = useRef(null);

  useEffect(() => {
    const node = printRef.current;
    if (!node) return;

    const PAGE_WIDTH_MM = 216; // letter
    const PAGE_HEIGHT_MM = 279; // letter
    const MM_TO_PX = 96 / 25.4;
    const pageWidthPx =
      (PAGE_WIDTH_MM - PRINT_MARGIN_HORIZONTAL_MM * 2) * MM_TO_PX;
    const pageHeightPx =
      (PAGE_HEIGHT_MM - PRINT_MARGIN_VERTICAL_MM * 2) * MM_TO_PX;

    node.style.setProperty("--print-scale", "1");
    const naturalWidth = node.offsetWidth;
    const naturalHeight = node.scrollHeight;
    const scaleToFillWidth = pageWidthPx / naturalWidth;
    const scaleToFillHeight = pageHeightPx / naturalHeight;
    const scale = Math.min(scaleToFillWidth, scaleToFillHeight);
    node.style.setProperty("--print-scale", scale.toFixed(3));
  }, [leaveRequest]);

  return (
    <>
      <div
        id={printAreaId}
        className="w-full h-full max-w-[850px] bg-white p-5 text-black shadow-sm"
      >
        <FormBody
          lr={lr}
          details={details}
          hasRecommendation={hasRecommendation}
          hasAction={hasAction}
        />
      </div>

      {createPortal(
        <div id={portalRootId}>
          <div
            id={`${printAreaId}-print-page`}
            className="csform6cos-print-page"
          >
            <div
              id={`${printAreaId}-print-copy`}
              ref={printRef}
              className="csform6cos-print-copy w-[740px] bg-white p-5 text-black"
              style={{ transform: "scale(var(--print-scale, 1))" }}
            >
              <FormBody
                lr={lr}
                details={details}
                hasRecommendation={hasRecommendation}
                hasAction={hasAction}
              />
            </div>
          </div>

          <style>{`
            .csform6cos-print-page {
              position: fixed;
              top: 0;
              left: -100000px;
              visibility: hidden;
              pointer-events: none;
            }

            @media print {
              @page { size: letter portrait; margin: 0; }

              body > *:not(#${portalRootId}) {
                display: none !important;
              }

              .csform6cos-print-page {
                position: fixed !important;
                top: ${PRINT_MARGIN_VERTICAL_MM}mm !important;
                right: ${PRINT_MARGIN_HORIZONTAL_MM}mm !important;
                bottom: ${PRINT_MARGIN_VERTICAL_MM}mm !important;
                left: ${PRINT_MARGIN_HORIZONTAL_MM}mm !important;
                width: auto !important;
                height: auto !important;
                visibility: visible !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              .csform6cos-print-copy {
                transform-origin: center center !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
              }

              .csform6cos-box {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .csform6cos-signature {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}</style>
        </div>,
        document.body,
      )}
    </>
  );
}
