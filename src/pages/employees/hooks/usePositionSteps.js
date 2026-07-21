import { useEffect, useState } from "react";
import { employeeService } from "@/services/employeeService";
import { positionLabel } from "../utils/employeeFormatters";
import { deriveOrgPlacementFromPosition } from "../utils/employeeHelpers";

/**
 * Everything tied to "which position is this employee in, and what does
 * that mean for salary grade / step / division / department" — for all
 * three employment types. Depends on `formData`/`setFormData` and the
 * `positions` list owned by useEmployeeFormState, plus the
 * hasHydratedRef/prevEmployeeTypeRef it also owns (so the employee-type
 * reset effect below only fires on genuine user-driven type switches, not
 * during initial hydration).
 */
export function usePositionSteps({
  formData,
  setFormData,
  positions,
  setSelectedPositionLabel,
  setSelectedStepLabel,
  hasHydratedRef,
  prevEmployeeTypeRef,
}) {
  const [steps, setSteps] = useState([]);
  const [cosPositions, setCosPositions] = useState([]);
  const [consultantPositions, setConsultantPositions] = useState([]);

  // ── COS / Consultant position lists (mount-only) ─────────────────────────
  useEffect(() => {
    employeeService
      .getCosPositions()
      .then(setCosPositions)
      .catch(() => setCosPositions([]));
    employeeService
      .getConsultantPositions()
      .then(setConsultantPositions)
      .catch(() => setConsultantPositions([]));
  }, []);

  // ── Plantilla position -> salary grade / division / department / steps ──
  useEffect(() => {
    if (
      !formData.plantillaPositionId ||
      !Array.isArray(positions) ||
      positions.length === 0
    ) {
      if (!formData.plantillaPositionId) {
        setSteps([]);
        setSelectedStepLabel("");
        setFormData((prev) => ({
          ...prev,
          stepIncrementId: "",
          stepNumber: "",
          sgLevel: "",
        }));
      }
      return;
    }
    const selectedPos = positions.find(
      (p) => String(p.id) === String(formData.plantillaPositionId),
    );
    if (selectedPos) {
      const sg =
        selectedPos.salary_grade?.salary_grade ??
        selectedPos.salaryGrade?.salary_grade ??
        "";
      const orgPlacement = deriveOrgPlacementFromPosition(selectedPos);

      const gradeAnnual =
        selectedPos.salary_grade?.annual_salary ??
        selectedPos.salaryGrade?.annual_salary ??
        "";
      const gradeMonthly =
        selectedPos.salary_grade?.monthly_salary ??
        selectedPos.salaryGrade?.monthly_salary ??
        (gradeAnnual !== "" ? (Number(gradeAnnual) / 12).toFixed(2) : "");

      setFormData((prev) => ({
        ...prev,
        sgLevel: sg ? String(sg) : "",
        ...(orgPlacement.division ? { division: orgPlacement.division } : {}),
        ...(orgPlacement.department
          ? { department: orgPlacement.department }
          : {}),
        ...(!prev.salaryOverride && !prev.stepIncrementId
          ? {
              annualSalary:
                gradeAnnual !== "" ? String(gradeAnnual) : prev.annualSalary,
              monthlySalary:
                gradeMonthly !== "" ? String(gradeMonthly) : prev.monthlySalary,
            }
          : {}),
      }));
    }

    let ignore = false;
    const stepIncrementIdAtRequestTime = formData.stepIncrementId;
    const salaryOverrideAtRequestTime = formData.salaryOverride;

    employeeService
      .getStepsByPosition(formData.plantillaPositionId)
      .then((res) => {
        if (ignore) return;
        const loaded = res ?? [];
        setSteps(loaded);

        if (stepIncrementIdAtRequestTime) {
          const existing = loaded.find(
            (s) => String(s.id) === String(stepIncrementIdAtRequestTime),
          );
          if (existing) {
            setSelectedStepLabel(`Step ${existing.step}`);
            if (!salaryOverrideAtRequestTime) {
              setFormData((prev) => ({
                ...prev,
                stepNumber: String(existing.step),
                annualSalary: existing.annual_salary ?? prev.annualSalary,
                monthlySalary: existing.monthly_salary ?? prev.monthlySalary,
              }));
            }
          }
          return;
        }

        if (loaded.length === 0) {
          setSelectedStepLabel("");
          return;
        }

        const selectedPosForStep = Array.isArray(positions)
          ? positions.find(
              (p) => String(p.id) === String(formData.plantillaPositionId),
            )
          : null;
        const designatedStepId =
          selectedPosForStep?.step_increment_id ??
          selectedPosForStep?.stepIncrementId ??
          null;

        const resolvedStep =
          (designatedStepId &&
            loaded.find((s) => String(s.id) === String(designatedStepId))) ||
          [...loaded].sort((a, b) => (a.step ?? 0) - (b.step ?? 0))[0];

        if (!resolvedStep) {
          setSelectedStepLabel("");
          return;
        }

        setSelectedStepLabel(`Step ${resolvedStep.step}`);
        setFormData((prev) => ({
          ...prev,
          stepIncrementId: String(resolvedStep.id),
          stepNumber: String(resolvedStep.step),
          ...(prev.salaryOverride
            ? {}
            : {
                annualSalary: resolvedStep.annual_salary ?? prev.annualSalary,
                monthlySalary:
                  resolvedStep.monthly_salary ?? prev.monthlySalary,
              }),
        }));
      })
      .catch(() => {
        if (!ignore) setSteps([]);
      });

    return () => {
      ignore = true;
    };
  }, [formData.plantillaPositionId, positions]);

  // ── Step increment -> label + (non-override) salary sync ────────────────
  useEffect(() => {
    if (!formData.stepIncrementId) {
      setSelectedStepLabel("");
      return;
    }
    const step = steps.find(
      (s) => String(s.id) === String(formData.stepIncrementId),
    );
    if (!step) return;

    setSelectedStepLabel(`Step ${step.step}`);

    if (formData.salaryOverride) return;
    setFormData((prev) => ({
      ...prev,
      annualSalary: step.annual_salary ?? "",
      monthlySalary: step.monthly_salary ?? "",
      stepNumber: String(step.step),
    }));
  }, [formData.stepIncrementId, steps, formData.salaryOverride]);

  // ── Employee type switch -> reset position/step/salary-override fields ──
  useEffect(() => {
    if (!hasHydratedRef.current) {
      prevEmployeeTypeRef.current = formData.employeeType;
      return;
    }

    const prevType = prevEmployeeTypeRef.current;
    const newType = formData.employeeType;

    if (prevType === newType) return;

    setFormData((prev) => ({
      ...prev,
      plantillaPositionId: "",
      stepIncrementId: "",
      stepNumber: "",
      sgLevel: "",
      salaryOverride: false,
    }));
    setSelectedPositionLabel("");
    setSteps([]);

    if (newType !== "Contract of Service") {
      setFormData((prev) => ({ ...prev, cosPositionId: "" }));
    }
    if (newType !== "Consultant") {
      setFormData((prev) => ({ ...prev, consultantPositionId: "" }));
    }

    prevEmployeeTypeRef.current = newType;
  }, [formData.employeeType]);

  const handlePositionChange = (id) => {
    const pos = Array.isArray(positions)
      ? positions.find((p) => String(p.id) === String(id))
      : null;
    const sg =
      pos?.salary_grade?.salary_grade ?? pos?.salaryGrade?.salary_grade ?? "";
    const orgPlacement = deriveOrgPlacementFromPosition(pos);
    const gradeAnnual =
      pos?.salary_grade?.annual_salary ?? pos?.salaryGrade?.annual_salary ?? "";
    const gradeMonthly =
      pos?.salary_grade?.monthly_salary ??
      pos?.salaryGrade?.monthly_salary ??
      (gradeAnnual !== "" ? (Number(gradeAnnual) / 12).toFixed(2) : "");

    setSelectedPositionLabel(positionLabel(pos));
    setSelectedStepLabel("");
    setFormData((prev) => ({
      ...prev,
      plantillaPositionId: id,
      sgLevel: sg ? String(sg) : "",
      stepIncrementId: "",
      stepNumber: "",
      annualSalary: prev.salaryOverride
        ? prev.annualSalary
        : gradeAnnual !== ""
          ? String(gradeAnnual)
          : "",
      monthlySalary: prev.salaryOverride
        ? prev.monthlySalary
        : gradeMonthly !== ""
          ? String(gradeMonthly)
          : "",
      ...(orgPlacement.division ? { division: orgPlacement.division } : {}),
      ...(orgPlacement.department
        ? { department: orgPlacement.department }
        : {}),
    }));
  };

  return { steps, cosPositions, consultantPositions, handlePositionChange };
}
