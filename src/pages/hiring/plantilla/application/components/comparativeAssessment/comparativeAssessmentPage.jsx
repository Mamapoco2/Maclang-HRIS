import { useState } from "react";
import {
  ChevronRight,
  X,
  Award,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

// ---- Mock data: this is what the Interview tab already has (applicants scheduled
// for the ongoing panel), plus the qualification data pulled from each applicant's
// Comparative Assessment Form. In the real module these come from the recruitment
// record and the position's plantilla requirements. ----

const position = {
  title: "Traffic Operations Officer V",
  item: "Item no: 19",
  salaryGrade: "SG-24",
  salary: "\u20B1102,603.00/mo",
  office: "Rosario Maclang Bautista General Hospital",
  requirements: {
    eligibility: "Career Service (Professional) / Second Level Eligibility",
    performance: "Very Satisfactory rating, past two (2) rating periods",
    education:
      "Master's degree or Certificate of Leadership and Management from the CSC",
    training:
      "40 hours of supervisory/management learning and development intervention",
    experience: "4 years of supervisory/management experience",
  },
};

const applicants = [
  {
    id: 1,
    name: "Marisol T. Enriquez",
    presentPosition: "Traffic Operations Officer IV",
    interviewTime: "9:00 AM",
    qualifications: {
      eligibility: {
        value: "Career Service (Professional), 2019",
        meets: true,
      },
      performance: { value: "Very Satisfactory (2024, 2025)", meets: true },
      education: {
        value: "MPA, Certificate of Leadership and Management, CSC",
        meets: true,
      },
      training: {
        value: "48 hours, Supervisory Development Course (2023)",
        meets: true,
      },
      experience: {
        value: "5 years as Traffic Operations Officer IV",
        meets: true,
      },
      remarks:
        "Meets all minimum qualification requirements. Strong performance track record.",
    },
  },
  {
    id: 2,
    name: "Ronaldo P. Castillo",
    presentPosition: "Administrative Officer III",
    interviewTime: "9:30 AM",
    qualifications: {
      eligibility: {
        value: "Career Service (Professional), 2016",
        meets: true,
      },
      performance: {
        value: "Very Satisfactory (2024), Satisfactory (2025)",
        meets: false,
      },
      education: {
        value: "BS Public Administration, units in MPA",
        meets: false,
      },
      training: {
        value: "32 hours, various management seminars",
        meets: false,
      },
      experience: {
        value: "3 years, 4 months in supervisory role",
        meets: false,
      },
      remarks:
        "Does not meet education, training, and experience requirements. Recommend for future consideration pending completion of master's units.",
    },
  },
  {
    id: 3,
    name: "Cecilia D. Ramos",
    presentPosition: "Traffic Operations Officer III",
    interviewTime: "10:00 AM",
    qualifications: {
      eligibility: {
        value: "Career Service (Professional), 2015",
        meets: true,
      },
      performance: { value: "Outstanding (2024, 2025)", meets: true },
      education: {
        value: "MPA, Certificate of Leadership and Management, CSC",
        meets: true,
      },
      training: {
        value: "56 hours, Supervisory/Management Development",
        meets: true,
      },
      experience: {
        value: "6 years in supervisory/management capacity",
        meets: true,
      },
      remarks:
        "Exceeds minimum requirements across all categories. Top-rated performance for two consecutive periods.",
    },
  },
];

const qualificationRows = [
  { key: "eligibility", label: "Eligibility", icon: Award },
  { key: "performance", label: "Performance", icon: ClipboardCheck },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "training", label: "Training", icon: BookOpen },
  { key: "experience", label: "Experience", icon: Briefcase },
];

function StatusPill({ meets }) {
  return meets ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Meets requirement
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <AlertCircle className="h-3.5 w-3.5" />
      Below requirement
    </span>
  );
}

function ApplicantQualificationView({ applicant, onClose }) {
  const q = applicant.qualifications;
  const metCount = qualificationRows.filter((r) => q[r.key].meets).length;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Comparative assessment
          </p>
          <h2 className="mt-1 text-xl font-serif text-slate-900">
            {applicant.name}
          </h2>
          <p className="text-sm text-slate-500">{applicant.presentPosition}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close qualification view"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Position to be filled reference */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="h-4 w-4" />
            <p className="text-sm font-medium">Position to be filled</p>
          </div>
          <p className="mt-1 font-serif text-base text-slate-900">
            {position.title}
          </p>
          <p className="text-xs text-slate-500">
            {position.item} &middot; {position.salaryGrade} &middot;{" "}
            {position.salary}
          </p>
        </div>

        {/* Summary */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            Qualification comparison
          </p>
          <p className="text-xs text-slate-500">
            {metCount} of {qualificationRows.length} requirements met
          </p>
        </div>

        {/* Comparison table */}
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="w-1/5 px-4 py-2.5 font-medium">Category</th>
                <th className="w-2/5 px-4 py-2.5 font-medium">Requirement</th>
                <th className="w-2/5 px-4 py-2.5 font-medium">
                  Candidate's qualification
                </th>
              </tr>
            </thead>
            <tbody>
              {qualificationRows.map(({ key, label, icon: Icon }) => (
                <tr key={key} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium">{label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {position.requirements[key]}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{q[key].value}</p>
                    <div className="mt-1.5">
                      <StatusPill meets={q[key].meets} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remarks */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-slate-700">
            <MessageSquare className="h-4 w-4" />
            <p className="text-sm font-medium">Remarks</p>
          </div>
          <p className="mt-1.5 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
            {q.remarks}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ComparativeAssessmentPage() {
  const [selectedId, setSelectedId] = useState(applicants[0].id);
  const selected = applicants.find((a) => a.id === selectedId);

  return (
    <div className="mt-2 mx-auto flex w-full h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Left: Interview tab applicant list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Interview tab
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {position.title}
          </p>
          <p className="text-xs text-slate-500">
            Scheduled applicants &middot; {applicants.length}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {applicants.map((a) => {
            const isActive = a.id === selectedId;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left transition-colors ${
                  isActive ? "bg-white" : "hover:bg-white/60"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-medium ${
                      isActive ? "text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {a.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {a.presentPosition}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {a.interviewTime}
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-500" : "text-slate-300"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Applicant qualification view */}
      <div className="flex-1">
        {selected ? (
          <ApplicantQualificationView applicant={selected} onClose={() => {}} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Select an applicant to view their qualifications
          </div>
        )}
      </div>
    </div>
  );
}
