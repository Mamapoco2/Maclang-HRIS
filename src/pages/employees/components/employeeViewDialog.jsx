import React, { useState } from "react";
import { Banknote, Building2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./shared/StatusBadge";
import {
  formatCurrency,
  formatDate,
  formatRole,
  getAvatarUrl,
  getDeptNames,
  getEmployeeStatus,
  toTitleCase,
} from "../utils/employeeDisplay";

// Name for the profile header: names in title case, professional titles
// (MD, RN, ...) kept in capitals.
function buildDisplayName(employee) {
  const clean = (v) => (v ? String(v).trim() : "");
  const withDot = (v) =>
    /^(dr|mr|ms|mrs|engr|atty|hon|jr|sr)$/i.test(v) ? `${v}.` : v;

  const prefix = toTitleCase(withDot(clean(employee.prefix)));
  const nameParts = [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
  ]
    .map(clean)
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ");
  const suffix = toTitleCase(withDot(clean(employee.suffix)));

  const titles = (
    Array.isArray(employee.title)
      ? employee.title
      : employee.title
        ? [employee.title]
        : []
  )
    .map((t) => clean(t).toUpperCase())
    .filter(Boolean)
    .join(", ");

  const withAffixes = [prefix, nameParts, suffix].filter(Boolean).join(" ");
  const full = titles ? `${withAffixes}, ${titles}` : withAffixes;

  return { full };
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">
        {value || (
          <span className="font-normal text-muted-foreground">Not set</span>
        )}
      </dd>
    </div>
  );
}

function Group({ icon: Icon, title, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <dl className="grid grid-cols-1 gap-y-4">{children}</dl>
    </section>
  );
}

function SalaryTile({ label, value }) {
  return (
    <div className="rounded-lg border bg-muted/40 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">
        {value || (
          <span className="text-sm font-normal text-muted-foreground">
            Not set
          </span>
        )}
      </p>
    </div>
  );
}

export default function EmployeeViewDialog({ open, onClose, employee }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!employee) return null;

  const info = employee.info || {};

  const assignment =
    employee.primaryAssignment ?? employee.primary_assignment ?? {};

  const legacyPositionInfo =
    assignment.plantilla_position ??
    assignment.plantillaPosition ??
    assignment.plantilla_item ??
    assignment.plantillaItem ??
    {};

  const employmentType = (employee.employment_type ?? "").toLowerCase().trim();
  const isPlantilla = employmentType === "plantilla" || employmentType === "";
  const isCos =
    employmentType === "contract of service" || employmentType === "cos";
  const isConsultant = employmentType === "consultant";

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
    legacyPositionInfo?.item?.title ??
    legacyPositionInfo?.position_title ??
    legacyPositionInfo?.title ??
    null;

  const isPlantillaPosition = resolvedPositionType === "plantilla";
  const positionItemNumber = isPlantillaPosition
    ? (positionInfo?.item_number ?? legacyPositionInfo?.item_number ?? null)
    : null;
  const positionDisplay =
    positionItemNumber && positionTitle
      ? `${positionItemNumber} · ${positionTitle}`
      : positionTitle;
  const positionRowLabel = isPlantillaPosition
    ? "Plantilla position"
    : "Position";

  const salaryGradeObj =
    legacyPositionInfo?.salary_grade ?? legacyPositionInfo?.salaryGrade ?? {};

  const stepIncrement =
    assignment.step_increment ?? assignment.stepIncrement ?? {};

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
  const status = getEmployeeStatus(employee);

  const { full } = buildDisplayName(employee);
  const role =
    formatRole(employee.role_position) || employee.position_designation;

  const contractFrom = formatDate(employee.contract_period_from, "short");
  const contractTo = formatDate(employee.contract_period_to, "short");

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[92dvh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">Employee profile</DialogTitle>
          <DialogDescription className="sr-only">
            Personal and employment details for {full || "this employee"}.
          </DialogDescription>

          <div className="max-h-[92dvh] overflow-y-auto">
            {/* Profile header */}
            <div className="flex flex-col gap-4 border-b bg-muted/40 px-6 py-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => avatarSrc && setPreviewOpen(true)}
                disabled={!avatarSrc}
                aria-label="Enlarge photo"
                className="shrink-0 self-start rounded-full outline-none transition-opacity focus-visible:ring-[3px] focus-visible:ring-ring/50 enabled:cursor-zoom-in enabled:hover:opacity-90 sm:self-auto"
              >
                <Avatar className="size-20 border-2 border-background shadow-sm">
                  <AvatarImage src={avatarSrc} className="object-cover" />
                  <AvatarFallback className="bg-muted text-xl font-semibold text-muted-foreground">
                    {employee.first_name?.[0]}
                    {employee.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </button>

              <div className="min-w-0 flex-1 space-y-1.5 pr-6">
                {employee.employee_number && (
                  <p className="font-mono text-xs text-muted-foreground">
                    {employee.employee_number}
                  </p>
                )}
                <h2 className="text-xl font-semibold leading-snug tracking-tight">
                  {full || "Unnamed employee"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {role ? toTitleCase(role) : "No position assigned"}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <StatusBadge status={status} />
                  {employee.employment_type && (
                    <Badge
                      variant="outline"
                      className="rounded-full font-medium"
                    >
                      {employee.employment_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8 px-6 py-6">
              <div className="grid gap-8 md:grid-cols-2">
                <Group icon={User} title="Personal information">
                  <Detail label="Email" value={email} />
                  <Detail
                    label="Birthdate"
                    value={formatDate(info.birthdate)}
                  />
                  <Detail
                    label="Gender"
                    value={info.gender && toTitleCase(info.gender)}
                  />
                  <Detail label="Contact number" value={info.contact} />
                  <Detail label="Address" value={info.address} />
                </Group>

                <Group icon={Building2} title="Assignment">
                  <Detail label="Division" value={employee.division?.name} />
                  <Detail
                    label="Department"
                    value={deptNames.length > 0 ? deptNames.join(", ") : null}
                  />
                  <Detail label={positionRowLabel} value={positionDisplay} />

                  {isPlantillaPosition && (
                    <div className="grid grid-cols-2 gap-4">
                      <Detail
                        label="Salary grade"
                        value={
                          salaryGradeLevel ? `SG-${salaryGradeLevel}` : null
                        }
                      />
                      <Detail
                        label="Step"
                        value={stepLabel ? `Step ${stepLabel}` : null}
                      />
                    </div>
                  )}

                  {(isCos || isConsultant) && (
                    <>
                      <Detail
                        label="First day of service"
                        value={formatDate(employee.first_day_of_service)}
                      />
                      <Detail
                        label="Contract period"
                        value={
                          contractFrom || contractTo
                            ? `${contractFrom ?? "-"} to ${contractTo ?? "-"}`
                            : null
                        }
                      />
                    </>
                  )}
                </Group>
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Banknote className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Compensation</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SalaryTile
                    label="Gross salary (monthly)"
                    value={formatCurrency(grossSalary)}
                  />
                  <SalaryTile
                    label="Annual salary"
                    value={formatCurrency(annualSalary)}
                  />
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm border-none p-2">
          <DialogTitle className="sr-only">Employee photo</DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged employee photo.
          </DialogDescription>
          <div className="flex items-center justify-center">
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
