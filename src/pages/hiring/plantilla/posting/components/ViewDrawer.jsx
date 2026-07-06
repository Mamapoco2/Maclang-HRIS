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
import { Button, DrawerPanel } from "./ui";
import { StatusBadge } from "./TableParts";
import { DOC_KEYS } from "./constants";
import { formatCurrency, formatDate } from "./utils";

export function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          <dd className="text-slate-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ViewDrawer({ item, onClose, isAdmin, onApply }) {
  if (!item) return <DrawerPanel open={false} onClose={onClose} />;
  const docsRequired = DOC_KEYS.filter((d) => item.requiredDocuments[d.key]);
  const applyDisabled =
    item.status === "Closed" || item.status === "Filled" || item.alreadyApplied;
  return (
    <DrawerPanel open={!!item} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {item.baseItemNumber}
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
              ["Item Number", item.baseItemNumber],
              ["Salary Grade", item.salaryGrade],
              ["Monthly Salary", formatCurrency(item.monthlySalary)],
              ["Employment Status", item.employmentStatus],
              ["Vacancy Count", item.vacantSlots ?? item.vacancies],
            ]}
          />
        </Section>
        <Section title="Assignment" icon={Building2}>
          <InfoGrid
            rows={[
              ["Office", item.office],
              ["Division", item.division],
              ["Section", item.section || "—"],
              ["Immediate Supervisor", item.immediateSupervisor],
            ]}
          />
        </Section>
        <Section title="Qualification Standards" icon={GraduationCap}>
          <InfoGrid
            stacked
            rows={[
              ["Education", item.qualifications.education || "—"],
              ["Experience", item.qualifications.experience || "—"],
              ["Training", item.qualifications.training || "—"],
              ["Eligibility", item.qualifications.eligibility || "—"],
              ["Competency", item.qualifications.competency || "—"],
            ]}
          />
        </Section>
        <Section title="Job Description" icon={ClipboardList}>
          <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
            {item.jobDescription}
          </div>
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
              ["Closing Date", formatDate(item.closingDate)],
              [
                "Expected Appointment Date",
                formatDate(item.expectedAppointmentDate),
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
