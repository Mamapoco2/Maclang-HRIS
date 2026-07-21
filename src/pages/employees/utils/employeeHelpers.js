/**
 * Resolves the Division/Department a plantilla position belongs to from
 * its encoded `display_target` (see EmployeeController::parseDisplayTarget
 * on the backend). Returns string IDs (or null) in the exact shape the
 * form's `division` / `department` fields expect.
 */
export const deriveOrgPlacementFromPosition = (pos) => {
  if (!pos) return { division: null, department: null };
  const div = pos.display_division ?? pos.displayDivision ?? null;
  const dept = pos.display_department ?? pos.displayDepartment ?? null;
  return {
    division: div?.id ? String(div.id) : null,
    department: dept?.id ? [String(dept.id)] : null,
  };
};

/**
 * Extracts the approved step-increment + compensation snapshot from either
 * a step-increment record directly, or an object that nests one under
 * `step_increment` / `stepIncrement` (as the employee's primary
 * assignment does). Never derives compensation from salary-grade tables —
 * only from the values actually saved on the step/assignment, per the
 * "compensation source of truth" rule for this module.
 */
export const deriveApprovedStepAndCompensation = (source) => {
  const empty = {
    stepId: "",
    stepNumber: "",
    stepLabel: "",
    monthlySalary: "",
    annualSalary: "",
  };
  if (!source) return empty;

  const step =
    source.step != null
      ? source
      : (source.step_increment ?? source.stepIncrement ?? null);

  if (!step) return empty;

  return {
    stepId: step.id != null ? String(step.id) : "",
    stepNumber: step.step != null ? String(step.step) : "",
    stepLabel: step.step != null ? `Step ${step.step}` : "",
    monthlySalary:
      step.monthly_salary != null ? String(step.monthly_salary) : "",
    annualSalary: step.annual_salary != null ? String(step.annual_salary) : "",
  };
};
