// src/pages/leave/LeaveRequestDocument.jsx
//
// Pure presentational replica of Civil Service Form No. 6
// (Application for Leave, Rev. 2020). No routing, no fetching —
// takes data in, renders the form. Used by both:
//   - LeaveRequestView.jsx   (full page, route-driven)
//   - LeaveRequestModal.jsx  (popup, opened from a table row)
//
// DATA CONTRACT — see normalizeLeaveRequest() below. Pass either
// the canonical shape directly, or a "loose" shape (e.g. straight
// off a table row) and normalizeLeaveRequest will map the common
// alternate field names onto it.
//
// PRINT STRATEGY —
//   - The form is ALWAYS rendered twice: once inline (the on-screen
//     preview, wherever this component is used) and once portaled to
//     document.body (the print copy, parked off-screen via CSS).
//     Neither copy is conditionally mounted based on JS/React state —
//     both exist in the DOM at all times.
//   - Visibility is controlled entirely by @media print. The browser
//     applies print media rules synchronously and deterministically
//     as part of generating print output, so there's no dependency on
//     a beforeprint/afterprint listener or a React re-render
//     committing in time (that race — an async setState racing the
//     browser's print-preview snapshot — is what let the live app
//     keep showing up in the printed/previewed output).
//   - During print: `body > *:not(#<printAreaId>-portal-root)` hides
//     the entire live app, and the print copy is switched from
//     off-screen/hidden to fixed-position/visible.
// Both render paths share the same <FormBody> component so the
// preview and the printed output never drift apart.

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import rmbghLogo from "../../../assets/rmbghlogo.png";

export const LEAVE_TYPES = [
  {
    key: "vacation",
    label: "Vacation Leave",
    citation: "(Sec. 51, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  },
  {
    key: "mandatory",
    label: "Mandatory/Forced Leave",
    citation: "(Sec. 25, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  },
  {
    key: "sick",
    label: "Sick Leave",
    citation: "(Sec. 43, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  },
  {
    key: "maternity",
    label: "Maternity Leave",
    citation: "(R.A. No. 11210 / IRR issued by CSC, DOLE and SSS)",
  },
  {
    key: "paternity",
    label: "Paternity Leave",
    citation: "(R.A. No. 8187 / CSC MC No. 71, s. 1998, as amended)",
  },
  {
    key: "special_privilege",
    label: "Special Privilege Leave",
    citation: "(Sec. 21, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  },
  {
    key: "solo_parent",
    label: "Solo Parent Leave",
    citation: "(RA No. 8972 / CSC MC No. 8, s. 2004)",
  },
  {
    key: "study",
    label: "Study Leave",
    citation: "(Sec. 68, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  },
  {
    key: "vawc",
    label: "10-Day VAWC Leave",
    citation: "(RA No. 9262 / CSC MC No. 15, s. 2005)",
  },
  {
    key: "rehabilitation",
    label: "Rehabilitation Privilege",
    citation: "(Sec. 55, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  },
  {
    key: "special_women",
    label: "Special Leave Benefits for Women",
    citation: "(RA No. 9710 / CSC MC No. 25, s. 2010)",
  },
  {
    key: "calamity",
    label: "Special Emergency (Calamity) Leave",
    citation: "(CSC MC No. 2, s. 2012, as amended)",
  },
  {
    key: "adoption",
    label: "Adoption Leave",
    citation: "(R.A. No. 8552)",
  },
];

// Maps common alternate field names (e.g. a flat table row using
// employeeName/department/startDate/endDate/days) onto the
// canonical LeaveRequest shape above. Fields already in canonical
// form pass through untouched. Purely additive — never drops data.
export function normalizeLeaveRequest(raw) {
  if (!raw) return raw;

  const hasNameParts = raw.lastName || raw.firstName || raw.middleName;

  return {
    ...raw,
    office: raw.office ?? raw.department ?? "",
    lastName: hasNameParts ? raw.lastName : undefined,
    firstName: hasNameParts ? raw.firstName : undefined,
    middleName: hasNameParts ? raw.middleName : undefined,
    // kept separately rather than force-split into name parts —
    // splitting "Last, First M." reliably needs a real name parser
    displayName: hasNameParts ? undefined : raw.employeeName,
    dateFiled: raw.dateFiled ?? raw.appliedDate,
    numberOfDays: raw.numberOfDays ?? raw.days,
    inclusiveDatesFrom: raw.inclusiveDatesFrom ?? raw.startDate,
    inclusiveDatesTo: raw.inclusiveDatesTo ?? raw.endDate,
    recommendation:
      raw.recommendation ??
      (raw.status === "rejected"
        ? {
            decision: "disapproval",
            disapprovalReason: raw.rejectionReason,
            officerName: raw.approverName,
          }
        : raw.status === "approved"
          ? { decision: "approval", officerName: raw.approverName }
          : undefined),
  };
}

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

function fullName(lr) {
  if (lr.displayName) return lr.displayName;
  return [lr.lastName, lr.firstName, lr.middleName].filter(Boolean).join(", ");
}

function Checkbox({ checked, children }) {
  return (
    <div className="flex items-start gap-1.5 py-0.5">
      <span
        aria-hidden="true"
        className={`csform6-box mt-0.5 inline-flex size-3.5 shrink-0 items-center justify-center border border-black text-[10px] leading-none ${
          checked ? "bg-black text-white" : "bg-white"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span className="text-[11px] leading-tight">{children}</span>
    </div>
  );
}

function Field({ label, value, className = "" }) {
  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      <span className="whitespace-nowrap text-[10px] font-semibold">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate border-b border-black px-1 text-[11px]">
        {value || "\u00A0"}
      </span>
    </div>
  );
}

// Shared form markup, rendered both for the inline on-screen preview
// and (via portal) for printing. Keeping this in one place means the
// preview and the printed output can never drift out of sync.
function FormBody({
  lr,
  details,
  hasCertification,
  hasRecommendation,
  hasAction,
}) {
  return (
    <>
      <header className="mb-2 flex items-start justify-between text-[9px]">
        <div>
          Civil Service Form No. 6
          <br />
          Revised 2020
        </div>
        <div className="font-semibold">ANNEX A</div>
      </header>

      <div className="mb-3 flex items-center justify-between gap-4 border-b border-black pb-2">
        <img
          src={rmbghLogo}
          alt="Agency Logo"
          className="size-16 shrink-0 rounded-full border border-black object-contain ml-15"
        />
        <div className="flex-1 text-center text-[11px] font-semibold leading-tight">
          Republic of the Philippines
          <br />
          <span className="italic">(Agency Name)</span>
          <br />
          <span className="italic">(Agency Address)</span>
        </div>
        <div className="w-24 shrink-0 border border-black p-1 text-center text-[8px]">
          Stamp of Date of Receipt
        </div>
      </div>

      <h1 className="mb-3 text-center text-lg font-bold tracking-wide">
        APPLICATION FOR LEAVE
      </h1>

      {/* 1–5 */}
      <div className="border border-black text-[11px]">
        <div className="grid grid-cols-2 gap-2 border-b border-black p-1.5">
          <Field label="1. OFFICE/DEPARTMENT" value={lr.office} />
          <Field label="2. NAME:" value={fullName(lr)} />
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-black p-1.5">
          <Field label="3. DATE OF FILING" value={formatDate(lr.dateFiled)} />
          <Field label="4. POSITION" value={lr.position} />
          <Field label="5. SALARY" value={lr.salary} />
        </div>

        <div className="border-b border-black text-center">
          <div className="inline-block py-2 text-[11px] font-bold leading-none">
            6. DETAILS OF APPLICATION
          </div>
        </div>

        {/* 6.A / 6.B */}
        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-2">
            <div className="mb-1 text-[10px] font-bold">
              6.A TYPE OF LEAVE TO BE AVAILED OF
            </div>
            {LEAVE_TYPES.map((t) => (
              <Checkbox key={t.key} checked={lr.leaveType === t.key}>
                {t.label}{" "}
                <span className="text-[9px] font-normal text-[#333]">
                  {t.citation}
                </span>
              </Checkbox>
            ))}
            <Checkbox checked={lr.leaveType === "others"}>Others</Checkbox>
            <div className="mt-1 border-b border-black text-[11px]">
              {lr.leaveType === "others" ? lr.othersSpecify : "\u00A0"}
            </div>
          </div>

          <div className="p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">
              6.B DETAILS OF LEAVE
            </div>

            {lr.leaveType === "vacation" ||
            lr.leaveType === "special_privilege" ? (
              <div className="mb-2">
                <div className="italic">
                  In case of Vacation/Special Privilege Leave:
                </div>
                <Checkbox checked={details.vacationLocation === "within"}>
                  Within the Philippines
                </Checkbox>
                <Checkbox checked={details.vacationLocation === "abroad"}>
                  Abroad (Specify){" "}
                  {details.vacationLocation === "abroad"
                    ? details.abroadSpecify
                    : ""}
                </Checkbox>
              </div>
            ) : null}

            {lr.leaveType === "sick" ? (
              <div className="mb-2">
                <div className="italic">In case of Sick Leave:</div>
                <Checkbox checked={details.sickType === "hospital"}>
                  In Hospital (Specify Illness){" "}
                  {details.sickType === "hospital" ? details.illness : ""}
                </Checkbox>
                <Checkbox checked={details.sickType === "outpatient"}>
                  Out Patient (Specify Illness){" "}
                  {details.sickType === "outpatient" ? details.illness : ""}
                </Checkbox>
              </div>
            ) : null}

            {lr.leaveType === "special_women" ? (
              <div className="mb-2">
                <div className="italic">
                  In case of Special Leave Benefits for Women:
                </div>
                <div className="border-b border-black">
                  (Specify Illness) {details.womenIllness}
                </div>
              </div>
            ) : null}

            {lr.leaveType === "study" ? (
              <div className="mb-2">
                <div className="italic">In case of Study Leave:</div>
                <Checkbox checked={details.studyPurpose === "masters"}>
                  Completion of Master&apos;s Degree
                </Checkbox>
                <Checkbox checked={details.studyPurpose === "bar_review"}>
                  BAR/Board Examination Review
                </Checkbox>
              </div>
            ) : null}

            <div className="italic">Other purpose:</div>
            <Checkbox checked={Boolean(details.monetization)}>
              Monetization of Leave Credits
            </Checkbox>
            <Checkbox checked={Boolean(details.terminalLeave)}>
              Terminal Leave
            </Checkbox>
          </div>
        </div>

        {/* 6.C / 6.D */}
        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">
              6.C NUMBER OF WORKING DAYS APPLIED FOR
            </div>
            <div className="mb-2 border-b border-black">
              {lr.numberOfDays ?? "\u00A0"}
            </div>
            <div className="mb-1 text-[10px] font-bold">INCLUSIVE DATES</div>
            <div className="border-b border-black">
              {lr.inclusiveDatesFrom
                ? `${formatDate(lr.inclusiveDatesFrom)} – ${formatDate(
                    lr.inclusiveDatesTo,
                  )}`
                : "\u00A0"}
            </div>
          </div>
          <div className="p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">6.D COMMUTATION</div>
            <Checkbox checked={lr.commutation === "not_requested"}>
              Not Requested
            </Checkbox>
            <Checkbox checked={lr.commutation === "requested"}>
              Requested
            </Checkbox>
            <div className="mt-6 border-t border-black pt-1 text-center text-[9px]">
              (Signature of Applicant)
            </div>
          </div>
        </div>

        <div className="border-b border-black text-center">
          <div className="inline-block py-2 text-[11px] font-bold leading-none">
            7. DETAILS OF ACTION ON APPLICATION
          </div>
        </div>

        {/* 7.A / 7.B */}
        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">
              7.A CERTIFICATION OF LEAVE CREDITS
            </div>
            <div className="mb-1 text-center">
              As of{" "}
              {hasCertification
                ? formatDate(lr.certification.asOfDate)
                : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
            </div>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5">Vacation Leave</th>
                  <th className="border border-black p-0.5">Sick Leave</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Total Earned", "totalEarned"],
                  ["Less this application", "lessThisApplication"],
                  ["Balance", "balance"],
                ].map(([rowLabel, key]) => (
                  <tr key={key}>
                    <td className="border border-black p-0.5 italic">
                      {rowLabel}
                    </td>
                    <td className="border border-black p-0.5 text-center">
                      {hasCertification
                        ? lr.certification.vacationLeave?.[key]
                        : ""}
                    </td>
                    <td className="border border-black p-0.5 text-center">
                      {hasCertification
                        ? lr.certification.sickLeave?.[key]
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 border-t border-black pt-1 text-center text-[9px]">
              {hasCertification ? lr.certification.officerName : "\u00A0"}
              <br />
              (Authorized Officer)
            </div>
          </div>

          <div className="p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">7.B RECOMMENDATION</div>
            <Checkbox
              checked={
                hasRecommendation && lr.recommendation.decision === "approval"
              }
            >
              For approval
            </Checkbox>
            <Checkbox
              checked={
                hasRecommendation &&
                lr.recommendation.decision === "disapproval"
              }
            >
              For disapproval due to{" "}
              {hasRecommendation && lr.recommendation.decision === "disapproval"
                ? lr.recommendation.disapprovalReason
                : ""}
            </Checkbox>
            <div className="mt-9 border-t border-black pt-1 text-center text-[9px]">
              {hasRecommendation ? lr.recommendation.officerName : "\u00A0"}
              <br />
              (Authorized Officer)
            </div>
          </div>
        </div>

        {/* 7.C / 7.D */}
        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">7.C APPROVED FOR:</div>
            <div>
              {hasAction ? (lr.action.daysWithPay ?? "") : "\u00A0"} days with
              pay
            </div>
            <div>
              {hasAction ? (lr.action.daysWithoutPay ?? "") : "\u00A0"} days
              without pay
            </div>
            <div>
              {hasAction ? (lr.action.othersSpecify ?? "") : "\u00A0"} others
              (Specify)
            </div>
          </div>
          <div className="p-2 text-[11px]">
            <div className="mb-1 text-[10px] font-bold">
              7.D DISAPPROVED DUE TO:
            </div>
            <div className="min-h-[3.5em] border-b border-black">
              {hasAction ? lr.action.disapprovedDue : ""}
            </div>
          </div>
        </div>

        {/* Shared sign-off for 7.C/7.D — one official approves or disapproves the whole action */}
        <div className="p-2 text-center text-[11px]">
          <div className="mx-auto mt-2 w-64 border-t border-black pt-1 text-[9px]">
            {hasAction ? lr.action.officialName : "\u00A0"}
            <br />
            (Authorized Official)
          </div>
        </div>
      </div>
    </>
  );
}

export default function LeaveRequestDocument({
  leaveRequest,
  printAreaId = "csform6-print-area",
}) {
  const lr = normalizeLeaveRequest(leaveRequest);
  const details = lr.details ?? {};
  const hasCertification = Boolean(lr.certification);
  const hasRecommendation = Boolean(lr.recommendation);
  const hasAction = Boolean(lr.action);

  const portalRootId = `${printAreaId}-portal-root`;

  // Print scaling: fit the print copy to exactly one legal-size page,
  // scaling UP as well as down. The print copy is deliberately given a
  // base width narrower than the page (see PRINT_BASE_WIDTH_PX below),
  // so there's room to grow into — then we scale it to fill whichever
  // dimension (width or height) is the tighter constraint. This
  // replaces the old shrink-only logic, which capped at scale 1
  // because the print copy's width already matched the page width
  // exactly, leaving no room to enlarge.
  //
  // PRINT_MARGIN_*_MM reserve thin margins around the page (see the
  // print stylesheet below, which offsets/insets the copy by these
  // amounts) — they're subtracted from the width/height budgets here
  // so the fit calculation still guarantees everything lands on a
  // single page without the margins pushing content off the edge.
  const PRINT_MARGIN_TOP_MM = 6;
  const PRINT_MARGIN_SIDE_MM = 4;
  const PRINT_MARGIN_BOTTOM_MM = 4;
  const printRef = useRef(null);

  useEffect(() => {
    const node = printRef.current;
    if (!node) return;

    const PAGE_WIDTH_MM = 216; // legal
    const PAGE_HEIGHT_MM = 356; // legal
    const MM_TO_PX = 96 / 25.4;
    const pageWidthPx = (PAGE_WIDTH_MM - PRINT_MARGIN_SIDE_MM * 2) * MM_TO_PX;
    const pageHeightPx =
      (PAGE_HEIGHT_MM - PRINT_MARGIN_TOP_MM - PRINT_MARGIN_BOTTOM_MM) *
      MM_TO_PX;

    node.style.setProperty("--print-scale", "1");
    const naturalWidth = node.offsetWidth;
    const naturalHeight = node.scrollHeight;
    const scaleToFillWidth = pageWidthPx / naturalWidth;
    const scaleToFillHeight = pageHeightPx / naturalHeight;
    // Use whichever ratio is smaller so neither dimension ever
    // overflows the page — this naturally allows scale > 1 (bigger)
    // when there's headroom, and still shrinks when content is long.
    const scale = Math.min(scaleToFillWidth, scaleToFillHeight);
    node.style.setProperty("--print-scale", scale.toFixed(3));
  }, [leaveRequest]);

  return (
    <>
      {/* On-screen preview — rendered normally, inline, right where
          this component is used (full page or inside a modal). This
          is the only copy visible on screen; it's hidden during
          printing (see the print-only stylesheet below, which hides
          the whole app except the portaled print copy). */}
      <div
        id={printAreaId}
        className="w-full h-full max-w-[850px] border border-black bg-white p-5 text-black shadow-sm"
      >
        <FormBody
          lr={lr}
          details={details}
          hasCertification={hasCertification}
          hasRecommendation={hasRecommendation}
          hasAction={hasAction}
        />
      </div>

      {/* Print-only copy. Always portaled to document.body (never
          conditionally mounted via JS state) so there is no reliance
          on a beforeprint/afterprint listener or a React re-render
          committing before the browser generates the print output —
          that race is what caused the live app to still show up in
          the print preview. Instead this copy is permanently present
          in the DOM, parked off-screen with visibility:hidden (which,
          unlike display:none, still lays it out so scrollHeight above
          measures correctly), and @media print rules below swap it
          into view and hide everything else. That swap is applied by
          the browser itself as part of print rendering, so it can
          never be "too late". */}
      {createPortal(
        <div id={portalRootId}>
          <div
            id={`${printAreaId}-print-copy`}
            ref={printRef}
            className="csform6-print-copy w-[740px] border border-black bg-white p-5 text-black"
            style={{ transform: "scale(var(--print-scale, 1))" }}
          >
            <FormBody
              lr={lr}
              details={details}
              hasCertification={hasCertification}
              hasRecommendation={hasRecommendation}
              hasAction={hasAction}
            />
          </div>

          <style>{`
            .csform6-print-copy {
              position: fixed;
              top: 0;
              left: -100000px;
              visibility: hidden;
              pointer-events: none;
              transform-origin: top left;
            }

            @media print {
              @page { size: legal portrait; margin: 0; }

              /* Hide the entire live app (sidebar, header, table,
                 modal overlay, etc.) in one shot. Whatever the app
                 root element is, it's a direct child of <body> and
                 gets caught by this — the print copy's portal root
                 is the only thing spared. */
              body > *:not(#${portalRootId}) {
                display: none !important;
              }

              .csform6-print-copy {
                position: fixed !important;
                top: ${PRINT_MARGIN_TOP_MM}mm !important;
                left: ${PRINT_MARGIN_SIDE_MM}mm !important;
                visibility: visible !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
              }

              .csform6-box {
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
