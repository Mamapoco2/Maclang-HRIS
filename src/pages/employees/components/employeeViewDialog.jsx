import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  User,
  Building2,
  TrendingUp,
} from "lucide-react";

const formatRole = (role) =>
  (Array.isArray(role) ? role : [role].filter(Boolean))
    .filter(Boolean)
    .join(", ") || null;

const getDeptNames = (employee) => {
  if (Array.isArray(employee.departments) && employee.departments.length > 0)
    return employee.departments.map((d) => d.name).filter(Boolean);
  if (employee.department?.name) return [employee.department.name];
  return [];
};

const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:8000"}/storage/${url}`;
};

const getStatusFromInfo = (employee, info) => {
  const manual = employee.employment_status?.toUpperCase();
  if (manual === "RESIGN") return "Resign";
  if (manual === "INACTIVE") return "Inactive";
  if (manual === "ACTIVE") return "Active";
  if (!info?.status || info.status === "EMPTY") return "Inactive";
  return "Active";
};

const STATUS_CONFIG = {
  Active: {
    dot: "bg-teal-500",
    pill: "text-teal-700 bg-teal-50 ring-1 ring-teal-200",
  },
  Inactive: {
    dot: "bg-gray-300",
    pill: "text-gray-500 bg-gray-100 ring-1 ring-gray-200",
  },
  Resign: {
    dot: "bg-red-400",
    pill: "text-red-600 bg-red-50 ring-1 ring-red-200",
  },
};

// ── Build: "DR. JUAN SANTOS DELA CRUZ JR., MD, RN" ────────────────────────
function buildDisplayName(employee) {
  const up = (v) => (v ? String(v).trim().toUpperCase() : "");

  const rawPrefix = up(employee.prefix);
  const prefix =
    rawPrefix && !rawPrefix.endsWith(".") ? `${rawPrefix}.` : rawPrefix;
  const first = up(employee.first_name);
  const middle = up(employee.middle_name);
  const last = up(employee.last_name);
  const rawSuffix = up(employee.suffix);
  const suffix =
    rawSuffix && !rawSuffix.endsWith(".") ? `${rawSuffix}.` : rawSuffix;

  const titleArr = Array.isArray(employee.title)
    ? employee.title.map(up).filter(Boolean)
    : employee.title
      ? [up(employee.title)]
      : [];
  const titleStr = titleArr.join(", ");

  const nameParts = [first, middle, last].filter(Boolean).join(" ");

  const withAffixes = [prefix, nameParts, suffix].filter(Boolean).join(" ");

  const full = titleStr ? `${withAffixes}, ${titleStr}` : withAffixes;

  return { full, withAffixes, titleStr, prefix, nameParts, suffix };
}

const formatCurrency = (value) =>
  value !== null && value !== undefined && value !== ""
    ? `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
    : null;

export default function EmployeeViewDialog({ open, onClose, employee }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!employee) return null;

  const info = employee.info || {};

  // Resolve assignment — support both camelCase and snake_case from API
  const assignment =
    employee.primaryAssignment ?? employee.primary_assignment ?? {};

  // Legacy nested position path (kept as a fallback for older cached
  // responses that predate the normalized `position_info` field).
  const legacyPositionInfo =
    assignment.plantilla_position ??
    assignment.plantillaPosition ??
    assignment.plantilla_item ??
    assignment.plantillaItem ??
    {};

  // Determine employee type (normalized) — computed before position
  // resolution since the label/title logic below depends on it.
  const employmentType = (employee.employment_type ?? "").toLowerCase().trim();
  const isPlantilla = employmentType === "plantilla" || employmentType === "";
  const isCos =
    employmentType === "contract of service" || employmentType === "cos";
  const isConsultant = employmentType === "consultant";

  // Normalized position info from the backend — a single, unambiguous
  // { type, title } shape for ALL employment types (Plantilla, COS,
  // Consultant), so we never have to guess which nested key holds the
  // right title. Falls back to the legacy nested shape for safety.
  const positionInfo = employee.position_info ?? null;
  const resolvedPositionType =
    positionInfo?.type ??
    (isPlantilla
      ? "plantilla"
      : isCos
        ? "cos"
        : isConsultant
          ? "consultant"
          : "plantilla");

  const positionTitle =
    positionInfo?.title ??
    // Legacy fallback: plantilla nests title under item.title / position_title,
    // COS/Consultant nest it directly under title.
    legacyPositionInfo?.item?.title ??
    legacyPositionInfo?.position_title ??
    legacyPositionInfo?.title ??
    null;

  const isPlantillaPosition = resolvedPositionType === "plantilla";
  const positionRowLabel = isPlantillaPosition
    ? "Plantilla Position"
    : "Position";

  // Salary grade: nested under salary_grade object (Plantilla only)
  const salaryGradeObj =
    legacyPositionInfo?.salary_grade ?? legacyPositionInfo?.salaryGrade ?? {};

  // Step increment
  const stepIncrement =
    assignment.step_increment ?? assignment.stepIncrement ?? {};

  // salary_history is the backend's source of truth for current gross/annual
  // pay across ALL employment types (Plantilla, COS, Consultant) — falls
  // back to the top-level employee.monthly_salary (new field), then the
  // legacy per-type fields for older records without a history row yet.
  const salaryHistory =
    employee.salary_history ?? employee.salaryHistory ?? null;

  const salaryGradeLevel =
    salaryHistory?.salary_grade ?? salaryGradeObj?.salary_grade ?? null;

  const grossSalary =
    salaryHistory?.gross_salary ??
    employee.monthly_salary ??
    salaryGradeObj?.monthly_salary ??
    null;

  const annualSalary =
    salaryHistory?.annual_salary ?? employee.annual_salary ?? null;

  const stepLabel = salaryHistory?.step ?? stepIncrement?.step ?? null;

  const deptNames = getDeptNames(employee);
  const avatarSrc = getAvatarUrl(employee.avatar_url);
  const email = employee.user?.email ?? info.email ?? null;
  const status = getStatusFromInfo(employee, info);
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Inactive;

  const { full } = buildDisplayName(employee);

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-none">
      <Icon className="h-3.5 w-3.5 text-gray-300 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-[13px] text-gray-800 mt-0.5 font-medium uppercase break-words">
          {value || <span className="text-gray-300 font-normal">—</span>}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-xl border-gray-200 gap-0 p-0">
          {/* Header bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <DialogTitle className="text-base font-semibold text-gray-800">
              Employee Profile
            </DialogTitle>
          </div>

          {/* Profile strip */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div
              className="cursor-pointer flex-shrink-0"
              onClick={() => avatarSrc && setPreviewOpen(true)}
            >
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-sm hover:opacity-90 transition-opacity">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-lg font-semibold">
                  {employee.first_name?.[0]}
                  {employee.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              {employee.employee_number && (
                <p className="text-[10px] text-gray-400 font-mono mb-1 uppercase tracking-widest">
                  {employee.employee_number}
                </p>
              )}

              <h2 className="text-base font-semibold text-gray-900 uppercase leading-snug">
                {full || "—"}
              </h2>

              <p className="text-xs text-gray-400 mt-0.5 truncate uppercase">
                {formatRole(employee.role_position) ||
                  employee.position_designation ||
                  "No position assigned"}
              </p>

              <div className="mt-2 flex gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.pill}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {status}
                </span>
                {employee.employment_type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-gray-200 bg-white text-gray-500 uppercase">
                    {employee.employment_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Two-column info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Personal */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Personal Information
              </p>
              <InfoRow icon={Mail} label="Email" value={email} />
              <InfoRow
                icon={Calendar}
                label="Birthdate"
                value={
                  info.birthdate
                    ? new Date(info.birthdate).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null
                }
              />
              <InfoRow icon={User} label="Gender" value={info.gender} />
              <InfoRow icon={Phone} label="Contact" value={info.contact} />
              <InfoRow icon={MapPin} label="Address" value={info.address} />
            </div>

            {/* Employment */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Employment Information
              </p>
              <InfoRow
                icon={Building2}
                label="Division"
                value={employee.division?.name}
              />
              <InfoRow
                icon={Users}
                label="Department"
                value={deptNames.length > 0 ? deptNames.join(", ") : null}
              />
              <InfoRow
                icon={Briefcase}
                label={positionRowLabel}
                value={positionTitle}
              />

              {/* Show Salary Grade and Step only for Plantilla employees */}
              {isPlantillaPosition && (
                <>
                  <InfoRow
                    icon={TrendingUp}
                    label="Salary Grade"
                    value={salaryGradeLevel ? `SG-${salaryGradeLevel}` : null}
                  />
                  <InfoRow
                    icon={TrendingUp}
                    label="Step"
                    value={stepLabel ? `Step ${stepLabel}` : null}
                  />
                </>
              )}

              {/* Annual Salary — top-level field, applies to all employment
                  types. Backed by salary_history (source of truth once an
                  employee has a recorded snapshot); falls back to the raw
                  employee.annual_salary for older records. */}
              <InfoRow
                icon={DollarSign}
                label="Annual Salary"
                value={formatCurrency(annualSalary)}
              />

              {/* Monthly (gross) salary — for Plantilla this comes from the
                  step increment via salary_history; for COS/Consultant it's
                  the manually-entered/derived value, resolved via
                  salary_history first, then the top-level monthly_salary
                  field, then legacy salary-grade data as a last resort. */}
              <InfoRow
                icon={DollarSign}
                label="Gross Salary"
                value={formatCurrency(grossSalary)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar full-size preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm p-2 border-none">
          <DialogTitle className="sr-only">Employee Avatar Preview</DialogTitle>
          <div className="flex justify-center items-center">
            <img
              src={avatarSrc}
              alt="Employee"
              className="max-h-[80vh] rounded-lg shadow-xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
