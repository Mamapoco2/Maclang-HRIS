import React from "react";
import {
  X,
  Briefcase,
  Building2,
  GraduationCap,
  ClipboardList,
  Award,
  UserCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button, DrawerPanel, normalizeQualificationDisplay } from "./ui";
import { StatusBadge } from "./TableParts";
import { DOC_KEYS } from "./constants";
import { formatCurrency, formatDate } from "./utils";
import { officeTypeLabel } from "./posting/postingHelpers";

export function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
        <Icon className="h-4 w-4 text-indigo-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function InfoGrid({ rows, stacked }) {
  return (
    <dl
      className={`grid gap-x-4 gap-y-2 text-sm ${stacked ? "grid-cols-1" : "grid-cols-2"}`}
    >
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-slate-400">{label}</dt>
          <dd className="whitespace-pre-wrap text-slate-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ViewDrawer({
  item,
  onClose,
  isAdmin,
  canViewClosingDate = false,
  onApply,
}) {
  if (!item) return <DrawerPanel open={false} onClose={onClose} />;
  const docsRequired = DOC_KEYS.filter((d) => item.requiredDocuments[d.key]);
  const applyDisabled =
    item.status === "Closed" || item.status === "Filled" || item.alreadyApplied;
  return (
    <DrawerPanel open={!!item} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {item.positionSlotNames?.[0] || item.baseItemNumber}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
            {item.positionTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-5">
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          {item.alreadyApplied && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <CheckCircle2 className="h-3 w-3" />
              Already Applied
            </span>
          )}
        </div>
        <Section title="Position Information" icon={Briefcase}>
          <InfoGrid
            rows={[
              ["Position Title", item.positionTitle],
              [
                "Item Number",
                item.positionSlotNames?.[0] || item.baseItemNumber,
              ],
              ["Salary Grade", item.salaryGrade],
              [
                "Step",
                item.stepIncrement ? `Step ${item.stepIncrement.step}` : "—",
              ],
              ["Monthly Salary", formatCurrency(item.monthlySalary)],
              ["Employment Status", item.employmentStatus],
            ]}
          />
        </Section>
        <Section title="Assignment" icon={Building2}>
          <InfoGrid
            rows={[
              ["Division", item.division],
              [officeTypeLabel(item.officeType), item.office],
              ["Immediate Supervisor", item.immediateSupervisor],
            ]}
          />
        </Section>
        <Section title="Qualification Standards" icon={GraduationCap}>
          <InfoGrid
            stacked
            rows={[
              [
                "Education",
                normalizeQualificationDisplay(item.qualifications.education) ||
                  "—",
              ],
              [
                "Experience",
                normalizeQualificationDisplay(item.qualifications.experience) ||
                  "—",
              ],
              [
                "Training",
                normalizeQualificationDisplay(item.qualifications.training) ||
                  "—",
              ],
              [
                "Eligibility",
                normalizeQualificationDisplay(
                  item.qualifications.eligibility,
                ) || "—",
              ],
              [
                "Competency",
                normalizeQualificationDisplay(item.qualifications.competency) ||
                  "—",
              ],
            ]}
          />
        </Section>
        <Section title="Required Documents" icon={Award}>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {docsRequired.length === 0 && (
              <li className="text-sm text-slate-400">
                No specific documents required.
              </li>
            )}
            {docsRequired.map((d) => (
              <li
                key={d.key}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {d.label}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Application Information" icon={UserCheck}>
          <InfoGrid
            rows={[
              ["Current Applicants", item.applicants],
              ["Remaining Slots", item.remainingVacancies ?? item.vacantSlots],
              ["Posting Date", formatDate(item.datePosted)],
              [
                canViewClosingDate ? "Closing Date" : "Application Deadline",
                formatDate(
                  canViewClosingDate
                    ? item.closingDate
                    : item.applicationDeadline,
                ),
              ],
            ]}
          />
        </Section>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Close
        </Button>
        {!isAdmin && (
          <Button className="flex-1" onClick={onApply} disabled={applyDisabled}>
            {item.alreadyApplied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Already Applied
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Apply Now
              </>
            )}
          </Button>
        )}
      </div>
    </DrawerPanel>
  );
}
