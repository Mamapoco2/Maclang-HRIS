// src/pages/profile/components/StepEducationAndWork.jsx
import { Section } from "./primitives";
import { RepeatableTable } from "./repeatableTable";
import { EDU_COLS } from "../../../constants/constants";

// ─── Education ────────────────────────────────────────────────────────────────
const EDU_LEVELS = [
  ["elementary", "Elementary"],
  ["secondary", "Secondary"],
  ["vocational", "Vocational / Trade Course"],
  ["college", "College"],
  ["graduate", "Graduate Studies"],
];

export function StepEducational({ v, set }) {
  return (
    <div className="space-y-6">
      <Section title="III. Educational Background (No. 26)">
        {EDU_LEVELS.map(([key, label]) => (
          <RepeatableTable
            key={key}
            label={label}
            rows={v[`edu_${key}`] ?? []}
            onChange={(r) => set(`edu_${key}`, r)}
            columns={EDU_COLS}
            addLabel={`Add ${label}`}
          />
        ))}
      </Section>
    </div>
  );
}

// ─── Eligibility ──────────────────────────────────────────────────────────────
export function StepEligibility({ v, set }) {
  return (
    <div className="space-y-5">
      <Section title="IV. Civil Service Eligibility (No. 27)">
        <p className="text-xs text-muted-foreground -mt-2">
          CES / CSEE / Career Service / RA 1080 (Board/Bar) / Under Special Laws
          / Category II or IV / Uniformed Personnel Eligibilities
        </p>
        <RepeatableTable
          rows={v.eligibilities ?? []}
          onChange={(r) => set("eligibilities", r)}
          addLabel="Add Eligibility"
          columns={[
            {
              key: "eligibility",
              label: "Career Service / Eligibility",
              placeholder: "ELIGIBILITY",
            },
            {
              key: "rating",
              label: "Rating (if applicable)",
              placeholder: "RATING",
            },
            {
              key: "exam_date",
              label: "Date of Exam/Conferment",
              type: "date",
            },
            {
              key: "place",
              label: "Place of Exam/Conferment",
              placeholder: "PLACE",
            },
            {
              key: "license_no",
              label: "License No.",
              placeholder: "LICENSE NO.",
            },
            { key: "valid_until", label: "Valid Until", type: "date" },
          ]}
        />
      </Section>
    </div>
  );
}

// ─── Work Experience ──────────────────────────────────────────────────────────
export function StepWorkExperience({ v, set }) {
  return (
    <div className="space-y-5">
      <Section title="V. Work Experience (No. 28)">
        <p className="text-xs text-muted-foreground -mt-2">
          Include private employment. Start from your most recent work.
        </p>
        <RepeatableTable
          rows={v.work_experiences ?? []}
          onChange={(r) => set("work_experiences", r)}
          addLabel="Add Work Experience"
          columns={[
            { key: "from", label: "From", type: "date" },
            { key: "to", label: "To", type: "date" },
            {
              key: "position",
              label: "Position Title",
              placeholder: "POSITION",
            },
            {
              key: "department",
              label: "Department/Agency/Company",
              placeholder: "COMPANY",
            },
            {
              key: "monthly_salary",
              label: "Monthly Salary",
              placeholder: "00000.00",
            },
            {
              key: "salary_grade",
              label: "Salary Grade & Step",
              placeholder: "00-0",
            },
            {
              key: "status",
              label: "Status of Appointment",
              placeholder: "PERMANENT",
            },
            {
              key: "govt_service",
              label: "Govt Service (Y/N)",
              type: "select",
              options: ["Y", "N"],
            },
          ]}
        />
      </Section>
    </div>
  );
}
