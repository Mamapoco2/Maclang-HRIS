export function normalisePosting(p) {
  const slotObjects = Array.isArray(p.plantilla_positions)
    ? p.plantilla_positions
    : Array.isArray(p.plantillaPositions)
      ? p.plantillaPositions
      : [];

  const positionSlotNames = p.position_slot_name
    ? p.position_slot_name
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : (p.positionSlotNames ??
      p.position_slot_names ??
      (slotObjects.length > 0
        ? slotObjects.map((s) => s.position_slot_name).filter(Boolean)
        : []));

  return {
    id: p.id,
    baseItemNumber: p.base_item_number,
    positionSlotNames,
    plantillaPositionIds:
      p.plantilla_position_ids ??
      (slotObjects.length > 0 ? slotObjects.map((s) => s.id) : []),
    positionTitle: p.title,
    officeId: p.display_department_id,
    office: p.department?.name || "—",
    divisionId: p.display_division_id,
    division: p.division?.name || "—",
    section: p.section || "",
    salaryGradeId: p.salary_grade_id,
    salaryGrade: p.salary_grade?.salary_grade
      ? `SG-${p.salary_grade.salary_grade}`
      : "—",
    stepIncrementId: p.step_increment_id,
    stepIncrement: p.step_increment
      ? {
          id: p.step_increment.id,
          step: p.step_increment.step,
          monthlySalary: Number(p.step_increment.monthly_salary || 0),
          annualSalary: Number(p.step_increment.annual_salary || 0),
        }
      : null,
    monthlySalary: Number(p.monthly_salary || 0),
    employmentStatus: p.employment_status,
    vacancies: p.vacancies,
    vacantSlots: p.vacant_slots,
    remainingVacancies: p.remaining_vacancies,
    datePosted: p.date_posted,
    closingDate: p.closing_date,
    expectedAppointmentDate: p.expected_appointment_date,
    status: p.effective_status || p.status,
    applicants: p.applications_count ?? 0,
    immediateSupervisor: p.immediate_supervisor || "—",
    alreadyApplied: !!p.already_applied,
    qualifications: {
      education: p.qualification_education || "",
      experience: p.qualification_experience || "",
      training: p.qualification_training || "",
      eligibility: p.qualification_eligibility || "",
      competency: p.qualification_competency || "",
    },
    jobDescription: p.job_description || "",
    requiredDocuments: p.required_documents || {},
  };
}

export function formatCurrency(n) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
