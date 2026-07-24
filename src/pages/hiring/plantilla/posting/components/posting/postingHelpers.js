// ── Timeline (Posting Date / Closing Date) ──────────────────────────────

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateString(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getTodayDateString() {
  return toDateString(new Date());
}

export function addMonths(dateStr, months) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  return toDateString(date);
}

export function computeClosingDate(postingDateStr) {
  return addMonths(postingDateStr, 9);
}

export function formatDateSlash(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return "—";
  return `${m}/${d}/${y}`;
}

// ── Slot name display ───────────────────────────────────────────────────

export function resolvePositionSlotNumbers(item) {
  const names =
    (Array.isArray(item?.positionSlotNames) && item.positionSlotNames.length > 0
      ? item.positionSlotNames
      : null) ??
    (Array.isArray(item?.position_slot_names) &&
    item.position_slot_names.length > 0
      ? item.position_slot_names
      : null) ??
    (item?.positionSlotName ? [item.positionSlotName] : null) ??
    (item?.position_slot_name ? [item.position_slot_name] : null);

  return { names: names ?? [] };
}

export function formatPositionSlotNumbers(item) {
  const { names } = resolvePositionSlotNumbers(item);
  return names.length > 0 ? names.join(", ") : "—";
}

// ── Create-mode vacant item filtering ───────────────────────────────────

export function extractPostedBaseItemNumbers(postings) {
  return new Set(
    (postings ?? [])
      .map((p) => p.base_item_number ?? p.baseItemNumber)
      .filter(Boolean),
  );
}

export function filterSelectableVacantItems(
  vacantItems,
  postedBaseItemNumbers = new Set(),
) {
  return (vacantItems ?? [])
    .filter((v) => (v.status || "").toLowerCase() !== "filled")
    .filter((v) => !postedBaseItemNumbers.has(v.base_item_number))
    .slice()
    .sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", undefined, {
        sensitivity: "base",
      }),
    );
}

export function getSelectableSlots(vacantItem) {
  return (vacantItem?.slots ?? []).filter(
    (s) => (s.status || "").toLowerCase() !== "filled",
  );
}

// ── Salary formatting (thousand separators, peso display, live typing) ───
export function stripSalarySeparators(raw) {
  if (raw === null || raw === undefined) return "";
  return String(raw).replace(/,/g, "").trim();
}

export function parseSalaryToNumber(raw) {
  const cleaned = stripSalarySeparators(raw);
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatSalaryNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "number" ? value : parseSalaryToNumber(value);
  if (n === null || !Number.isFinite(n)) return "";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSalaryCurrency(value) {
  const formatted = formatSalaryNumber(value);
  return formatted ? `\u20B1${formatted}` : "\u2014";
}

export function formatSalaryLiveInput(raw) {
  if (raw === null || raw === undefined) return "";
  let str = String(raw).replace(/[^\d.]/g, "");

  const firstDot = str.indexOf(".");
  if (firstDot !== -1) {
    str =
      str.slice(0, firstDot + 1) + str.slice(firstDot + 1).replace(/\./g, "");
  }

  const [intPartRaw = "", decPart] = str.split(".");
  const intPart = intPartRaw.replace(/^0+(?=\d)/, "");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decPart !== undefined
    ? `${groupedInt}.${decPart.slice(0, 2)}`
    : groupedInt;
}

// ── Linked monthly/annual salary fields ─────────────────────────────────

export function deriveAnnualFromMonthly(raw) {
  const n = parseSalaryToNumber(raw);
  return n !== null ? formatSalaryNumber(n * 12) : null;
}

export function deriveMonthlyFromAnnual(raw) {
  const n = parseSalaryToNumber(raw);
  return n !== null ? formatSalaryNumber(n / 12) : null;
}

// ── Validation ───────────────────────────────────────────────────────────

export function validatePostingForm(form, { mode }) {
  const errors = {};
  if (!form.base_item_number?.trim())
    errors.base_item_number = "Position is required.";
  if (!form.position_slot_names || form.position_slot_names.length === 0)
    errors.position_slot_names =
      "At least one available item number is required.";
  if (!form.title?.trim()) errors.title = "Position title is required.";
  if (!form.employment_status)
    errors.employment_status = "Employment status is required.";
  if (!form.vacancies || Number(form.vacancies) <= 0)
    errors.vacancies = "Vacancies must be greater than zero.";
  if (
    mode === "create" &&
    form.plantilla_position_ids?.length !== Number(form.vacancies)
  )
    errors.vacancies =
      "Vacancies must equal the number of available item numbers under the selected position.";
  if (!form.date_posted) errors.date_posted = "Posting date is required.";
  if (!form.closing_date) errors.closing_date = "Closing date is required.";
  if (
    form.date_posted &&
    form.closing_date &&
    new Date(form.closing_date) < new Date(form.date_posted)
  )
    errors.closing_date = "Closing date cannot be earlier than posting date.";
  return errors;
}

// ── Save payload ─────────────────────────────────────────────────────────

export function buildSavePayload(form, mode) {
  const payload = {
    ...form,
    display_department_id: form.display_department_id || null,
    display_division_id: form.display_division_id || null,
    salary_grade_id: form.salary_grade_id || null,
    step_increment_id: form.step_increment_id || null,
    monthly_salary: parseSalaryToNumber(form.monthly_salary),
    annual_salary: parseSalaryToNumber(form.annual_salary),
    vacancies: Number(form.vacancies),
    expected_appointment_date: form.expected_appointment_date || null,
  };
  if (mode === "edit") {
    delete payload.plantilla_position_ids;
  }
  return payload;
}

// ── Edit-mode form construction ─────────────────────────────────────────

export function buildEditFormFromRecord(d) {
  const rawMonthly = d.monthlySalary ?? d.monthly_salary ?? null;
  const rawAnnual = d.annualSalary ?? d.annual_salary ?? null;

  const monthlyNum = parseSalaryToNumber(rawMonthly);
  const annualNum = parseSalaryToNumber(rawAnnual);

  let resolvedMonthly = monthlyNum;
  let resolvedAnnual = annualNum;

  if (monthlyNum !== null && annualNum === null) {
    resolvedAnnual = Number((monthlyNum * 12).toFixed(2));
    console.warn(
      "[EditPostingDialog] annual_salary missing from posting record " +
        `(id: ${d.id}); derived from monthly_salary (${monthlyNum}). ` +
        "Check the API response / mapping layer — annual_salary should " +
        "be persisted and returned directly rather than derived client-side.",
    );
  } else if (annualNum !== null && monthlyNum === null) {
    resolvedMonthly = Number((annualNum / 12).toFixed(2));
    console.warn(
      "[EditPostingDialog] monthly_salary missing from posting record " +
        `(id: ${d.id}); derived from annual_salary (${annualNum}). ` +
        "Check the API response / mapping layer — monthly_salary should " +
        "be persisted and returned directly rather than derived client-side.",
    );
  } else if (monthlyNum === null && annualNum === null) {
    console.warn(
      `[EditPostingDialog] Neither monthly_salary nor annual_salary present on posting record (id: ${d.id}).`,
    );
  }

  let resolvedSlotNames;
  if (Array.isArray(d.positionSlotNames) && d.positionSlotNames.length > 0) {
    resolvedSlotNames = d.positionSlotNames;
  } else if (d.positionSlotName) {
    resolvedSlotNames = [d.positionSlotName];
  } else {
    resolvedSlotNames = [];
    console.warn(
      `[EditPostingDialog] Posting (id: ${d.id}) is missing position_slot_name ` +
        "on its saved record — the Edit dialog will show a blank slot name " +
        `rather than substituting base_item_number ("${d.baseItemNumber}"), ` +
        "since that would display the wrong value whenever a plantilla " +
        "item has more than one slot. Fix the API response / mapping " +
        "layer that produces this record so it includes the saved " +
        "position_slot_name(s).",
    );
  }

  const form = {
    id: d.id,
    base_item_number: d.baseItemNumber,
    position_slot_names: resolvedSlotNames,
    plantilla_position_ids: Array.isArray(d.plantillaPositionIds)
      ? d.plantillaPositionIds
      : d.plantillaPositionId != null
        ? [d.plantillaPositionId]
        : [],
    title: d.positionTitle,
    display_department_id: d.officeId ?? "",
    display_division_id: d.divisionId ?? "",
    section: d.section,
    salary_grade_id: d.salaryGradeId ?? "",
    step_increment_id: d.stepIncrementId ?? "",
    monthly_salary: formatSalaryNumber(resolvedMonthly),
    annual_salary: formatSalaryNumber(resolvedAnnual),
    employment_status: d.employmentStatus,
    vacancies: String(d.vacancies),
    immediate_supervisor:
      d.immediateSupervisor === "—" ? "" : (d.immediateSupervisor ?? ""),
    qualification_education: d.qualifications.education,
    qualification_experience: d.qualifications.experience,
    qualification_training: d.qualifications.training,
    qualification_eligibility: d.qualifications.eligibility,
    qualification_competency: d.qualifications.competency,
    date_posted: d.datePosted,
    closing_date: d.closingDate,
    expected_appointment_date: d.expectedAppointmentDate || "",
    status: d.status,
    required_documents: { ...d.requiredDocuments },
  };

  const stepFromRecord =
    d.stepIncrement?.step ??
    d.step_increment?.step ??
    d.stepLabel ??
    d.step ??
    null;

  if (stepFromRecord === null && d.stepIncrementId) {
    console.warn(
      `[EditPostingDialog] Posting (id: ${d.id}) has a step_increment_id ` +
        `(${d.stepIncrementId}) but no step label was included on the ` +
        "posting record. Ensure the fetch backing this dialog eager-loads " +
        "`stepIncrement` (same as the Posting Modal's show() request) " +
        "instead of reusing a list-row payload that omits it — the Edit " +
        "dialog will NOT guess a step from currently-vacant plantilla " +
        "items, since that could show the wrong slot's data.",
    );
  }

  return {
    form,
    stepLabel: stepFromRecord !== null ? `Step ${stepFromRecord}` : "—",
  };
}
