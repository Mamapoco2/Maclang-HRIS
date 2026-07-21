import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { employeeService } from "@/services/employeeService";
import { INITIAL_EMPLOYEE_FORM_STATE } from "../utils/employeeConstants";
import {
  normalizeEmployeeType,
  positionLabel,
  toMoneyString,
  applyEmployeeNumberPrefix,
} from "../utils/employeeFormatters";
import {
  deriveOrgPlacementFromPosition,
  deriveApprovedStepAndCompensation,
} from "../utils/employeeHelpers";

/**
 * Owns the employee record's core form state and the "load everything
 * needed to edit this employee" effect: departments, assignable plantilla
 * positions, and any pending PSB-application provision, then hydrates
 * `formData` from the employee (or resets to blank for a new hire).
 *
 * Two employee-number behaviors live here (both extracted verbatim):
 *  1. On every hydration, the number's prefix (RMBGH-/CT-/CS-) is synced
 *     to the record's current employment_type — covers records whose type
 *     changed after the number was first assigned.
 *  2. When a completed PSB application auto-provisions this record to
 *     Plantilla, the prefix is (re)synced to Plantilla as part of that
 *     override, mirroring the manual "click the Plantilla pill" behavior.
 */
export function useEmployeeFormState(employee) {
  const [formData, setFormData] = useState(INITIAL_EMPLOYEE_FORM_STATE);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [pendingProvision, setPendingProvision] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [selectedPositionLabel, setSelectedPositionLabel] = useState("");
  const [selectedStepLabel, setSelectedStepLabel] = useState("");
  const [pdsValues, setPdsValues] = useState({});

  const hasHydratedRef = useRef(false);
  const prevEmployeeTypeRef = useRef(formData.employeeType);
  const provisionAppliedRef = useRef(false);
  const loadedEmployeeIdRef = useRef(undefined);

  useEffect(() => {
    const currentEmployeeId = employee?.id ?? null;
    if (
      loadedEmployeeIdRef.current === currentEmployeeId &&
      hasHydratedRef.current
    ) {
      return;
    }
    loadedEmployeeIdRef.current = currentEmployeeId;

    let ignore = false;

    const fetchAndInit = async () => {
      setInitializing(true);

      try {
        const [dept, positionList, pendingProvisionRes] = await Promise.all([
          employeeService.getDepartments(),
          employeeService.getAssignablePositions(employee?.id ?? null),
          employee?.id
            ? employeeService
                .getPendingPlantillaProvision(employee.id)
                .catch(() => ({ pending: false }))
            : Promise.resolve({ pending: false }),
        ]);

        if (ignore) return;

        const deptList = dept.data ?? dept;
        const validDeptIds = deptList.map((d) => String(d.id));
        setDepartments(deptList);
        setPositions(Array.isArray(positionList) ? positionList : []);

        const pendingProvisionData = pendingProvisionRes?.pending
          ? pendingProvisionRes
          : null;
        setPendingProvision(pendingProvisionData);

        if (!employee) {
          provisionAppliedRef.current = false;
          return;
        }

        const rawDeptIds = Array.isArray(employee.department_ids)
          ? employee.department_ids.map(String)
          : employee.department_id
            ? [String(employee.department_id)]
            : [];
        const safeDeptIds = rawDeptIds.filter((id) =>
          validDeptIds.includes(id),
        );

        const assignment =
          employee.primary_assignment ?? employee.primaryAssignment ?? null;
        const position =
          assignment?.plantilla_position ??
          assignment?.plantillaPosition ??
          null;
        const assignmentStep =
          assignment?.step_increment ?? assignment?.stepIncrement ?? null;
        const sgValue =
          position?.salary_grade?.salary_grade ??
          position?.salaryGrade?.salary_grade ??
          "";

        const approvedStep = deriveApprovedStepAndCompensation(assignmentStep);

        const toUpperArray = (val) =>
          (Array.isArray(val) ? val : val ? [val] : []).map((v) =>
            String(v).toUpperCase(),
          );

        const nextEmployeeType = normalizeEmployeeType(
          employee.employment_type,
        );

        let finalFormData = {
          // ── Employee No. prefix sync ─────────────────────────────────────
          // Keeps the number's prefix (RMBGH-/CT-/CS-) in sync with the
          // record's current employment_type on every load — covers cases
          // where the type was changed/saved previously but the number
          // still carries the old prefix (e.g. converted from COS to
          // Plantilla outside the pendingProvision auto-fill flow below).
          employeeNumber: applyEmployeeNumberPrefix(
            employee.employee_number ?? "",
            nextEmployeeType,
          ),
          rolePosition: toUpperArray(employee.role_position),
          designation: toUpperArray(employee.position_designation),
          division: employee.division_id ? String(employee.division_id) : "",
          prefix: employee.prefix ? String(employee.prefix).toUpperCase() : "",
          firstName: employee.first_name ?? "",
          middleName: employee.middle_name ?? "",
          lastName: employee.last_name ?? "",
          suffix: employee.suffix ? String(employee.suffix).toUpperCase() : "",
          title: toUpperArray(employee.title),
          gender: employee.info?.gender
            ? String(employee.info.gender).toUpperCase()
            : "",
          department: safeDeptIds,
          employeeType: nextEmployeeType,
          status: employee.employment_status
            ? String(employee.employment_status).toUpperCase()
            : "",
          plantillaPositionId: position?.id ? String(position.id) : "",
          stepIncrementId: approvedStep.stepId,
          stepNumber: approvedStep.stepNumber,
          sgLevel: sgValue ? String(sgValue) : "",
          // ── Historical salary preservation ──────────────────────────────
          // Per requirement: the Employee record's own monthly_salary /
          // annual_salary are the source of truth and must render exactly
          // as saved (2 decimals, comma-formatted) — never recomputed from
          // the position's current Salary Grade or Step Increment here.
          annualSalary: toMoneyString(employee.annual_salary),
          monthlySalary: toMoneyString(employee.monthly_salary),
          salaryOverride: !!employee.salary_override,
          cosPositionId: employee.cos_position_id
            ? String(employee.cos_position_id)
            : "",
          consultantPositionId: employee.consultant_position_id
            ? String(employee.consultant_position_id)
            : "",
        };

        let finalPositionLabel = positionLabel(position);
        let finalStepLabel = approvedStep.stepLabel;

        if (pendingProvisionData?.plantilla_position) {
          const pos = pendingProvisionData.plantilla_position;
          const orgPlacement = deriveOrgPlacementFromPosition(pos);

          // ── Hire-time salary source of truth ───────────────────────────
          // The approved Plantilla Posting's own saved monthly_salary /
          // annual_salary are authoritative here — NOT the position's
          // current Salary Grade default and NOT a Step Increment
          // computation. We also force salaryOverride = true so the
          // existing override guard (used throughout usePositionSteps'
          // SG/step sync effects) protects these values from being
          // silently recomputed, both now and on every future load of
          // this record — satisfying the "preserve historical salary even
          // if the posting/position later changes" requirement.
          const postingMonthly = toMoneyString(pos.monthly_salary);
          const postingAnnual = toMoneyString(pos.annual_salary);

          finalFormData = {
            ...finalFormData,
            employeeType: "Plantilla",
            // ── Employee No. prefix sync ──────────────────────────────────
            // When a completed PSB application auto-provisions this record
            // to Plantilla (from COS/Consultant), the Employee No. prefix
            // must switch to RMBGH- together with the type — mirrors the
            // manual "click the Plantilla pill" behavior.
            employeeNumber: applyEmployeeNumberPrefix(
              finalFormData.employeeNumber,
              "Plantilla",
            ),
            plantillaPositionId: String(pos.id),
            stepIncrementId: "",
            stepNumber: "",
            sgLevel: pos.salary_grade
              ? String(pos.salary_grade)
              : finalFormData.sgLevel,
            monthlySalary: postingMonthly || finalFormData.monthlySalary,
            annualSalary: postingAnnual || finalFormData.annualSalary,
            salaryOverride: true,
            ...(orgPlacement.division
              ? { division: orgPlacement.division }
              : {}),
            ...(orgPlacement.department
              ? { department: orgPlacement.department }
              : {}),
          };
          finalPositionLabel = positionLabel({
            position_slot_name: pos.position_slot_name,
            position_title: pos.position_title,
          });
          finalStepLabel = "";
          provisionAppliedRef.current = true;
        } else {
          provisionAppliedRef.current = false;
        }

        setFormData(finalFormData);
        setSelectedPositionLabel(finalPositionLabel);
        setSelectedStepLabel(finalStepLabel);
        prevEmployeeTypeRef.current = finalFormData.employeeType;

        if (employee.profile) setPdsValues(employee.profile);

        if (pendingProvisionData?.plantilla_position) {
          toast.info(
            `Auto-filled from completed application: ${pendingProvisionData.posting_title}. Review and save to provision.`,
          );
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          toast.error("Failed to load employee data.");
        }
      } finally {
        if (!ignore) {
          setInitializing(false);
          hasHydratedRef.current = true;
        }
      }
    };

    fetchAndInit();

    return () => {
      ignore = true;
    };
  }, [employee?.id]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));

  const setPdsField = (key, val) =>
    setPdsValues((prev) => ({ ...prev, [key]: val }));

  return {
    formData,
    setFormData,
    handleChange,
    departments,
    positions,
    pendingProvision,
    initializing,
    selectedPositionLabel,
    setSelectedPositionLabel,
    selectedStepLabel,
    setSelectedStepLabel,
    pdsValues,
    setPdsField,
    hasHydratedRef,
    prevEmployeeTypeRef,
  };
}
