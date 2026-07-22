import { PDS_TABLE_KEYS } from "./employeeConstants";

const up = (v) => (v ? String(v).toUpperCase() : "");

export function buildEmployeeFormData({
  formData,
  pdsValues,
  avatarFile,
  salaryInputSource,
}) {
  const form = new FormData();
  form.append("employee_number", up(formData.employeeNumber));

  const designations = Array.isArray(formData.designation)
    ? formData.designation
    : [formData.designation].filter(Boolean);
  designations.forEach((d) => form.append("position_designation[]", up(d)));
  form.append("division_id", formData.division);

  const roles = Array.isArray(formData.rolePosition)
    ? formData.rolePosition
    : [formData.rolePosition].filter(Boolean);
  roles.forEach((r) => form.append("role_position[]", up(r)));

  const deptIds = (
    Array.isArray(formData.department)
      ? formData.department
      : [formData.department].filter(Boolean)
  ).filter((id) => id && !isNaN(Number(id)));
  deptIds.forEach((id) => form.append("department_ids[]", id));

  form.append("employment_type", formData.employeeType);
  form.append("employment_status", up(formData.status));
  form.append("plantilla_position_id", formData.plantillaPositionId);
  form.append("step_increment_id", formData.stepIncrementId);
  form.append("cos_position_id", formData.cosPositionId);
  form.append("consultant_position_id", formData.consultantPositionId);
  form.append("first_name", up(formData.firstName));
  form.append("middle_name", up(formData.middleName));
  form.append("last_name", up(formData.lastName));
  form.append("prefix", up(formData.prefix));
  form.append("suffix", up(formData.suffix));

  const titles = Array.isArray(formData.title)
    ? formData.title
    : [formData.title].filter(Boolean);
  titles.forEach((t) => form.append("title[]", up(t)));
  form.append("gender", up(formData.gender));
  if (avatarFile) form.append("avatar_url", avatarFile);

  if (formData.monthlySalary !== "" && formData.monthlySalary !== null) {
    form.append("monthly_salary", formData.monthlySalary);
  }
  if (formData.annualSalary !== "" && formData.annualSalary !== null) {
    form.append("annual_salary", formData.annualSalary);
  }
  form.append(
    "salary_override",
    formData.employeeType === "Plantilla" && formData.salaryOverride
      ? "1"
      : "0",
  );
  if (salaryInputSource) {
    form.append("salary_input_source", salaryInputSource);
  }

  Object.entries(pdsValues).forEach(([key, val]) => {
    if (PDS_TABLE_KEYS.includes(key)) {
      if (Array.isArray(val) && val.length > 0)
        form.append(`pds_${key}`, JSON.stringify(val));
    } else if (val !== null && val !== undefined && val !== "") {
      form.append(`pds_${key}`, val);
    }
  });

  return form;
}
