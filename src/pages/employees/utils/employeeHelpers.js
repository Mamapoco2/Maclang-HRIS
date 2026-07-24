export const deriveOrgPlacementFromPosition = (pos) => {
  if (!pos) return { division: null, department: null };
  const div = pos.display_division ?? pos.displayDivision ?? null;
  const dept = pos.display_department ?? pos.displayDepartment ?? null;
  return {
    division: div?.id ? String(div.id) : null,
    department: dept?.id ? [String(dept.id)] : null,
  };
};

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
