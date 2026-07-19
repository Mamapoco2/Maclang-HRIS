import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeService } from "@/services/employeeService";
import { toast } from "sonner";
import {
  Check,
  ChevronsUpDown,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { StepPersonalInfo } from "@/pages/profile/components/stepPersonalInfo";
import { StepFamilyBackground } from "@/pages/profile/components/stepFamilyBackground";
import {
  StepEducational,
  StepEligibility,
  StepWorkExperience,
} from "@/pages/profile/components/stepEducationAndWork";
import {
  StepVoluntaryAndLnd,
  StepOtherInfo,
  StepQuestions,
  StepReferencesAndId,
} from "@/pages/profile/components/stepMiscellaneous";
import { STEPS } from "@/constants/constants";

// ─── PDS step map ─────────────────────────────────────────────────────────────
const PDS_STEP_COMPONENTS = {
  personal: StepPersonalInfo,
  family: StepFamilyBackground,
  education: StepEducational,
  eligibility: StepEligibility,
  work: StepWorkExperience,
  voluntary: StepVoluntaryAndLnd,
  other: StepOtherInfo,
  questions: StepQuestions,
  references: StepReferencesAndId,
};

const TABS = [
  { id: "employment", label: "Employment" },
  { id: "pds", label: "Personal Data Sheet" },
];

const EMPLOYEE_TYPES = [
  { value: "Plantilla", label: "Plantilla" },
  { value: "Contract of Service", label: "Contract of Service" },
  { value: "Consultant", label: "Consultant" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeEmployeeType = (raw) => {
  const map = {
    plantilla: "Plantilla",
    "contract of service": "Contract of Service",
    cos: "Contract of Service",
    consultant: "Consultant",
  };
  return map[(raw ?? "").toLowerCase().trim()] ?? raw ?? "Plantilla";
};

const positionLabel = (pos) => {
  if (!pos) return "";
  const slot = pos.position_slot_name ?? pos.item_number ?? "";
  const title = pos.position_title ?? pos.title ?? "";
  return slot && title ? `${slot} — ${title}` : slot || title;
};

const deriveOrgPlacementFromPosition = (pos) => {
  if (!pos) return { division: null, department: null };
  const div = pos.display_division ?? pos.displayDivision ?? null;
  const dept = pos.display_department ?? pos.displayDepartment ?? null;
  return {
    division: div?.id ? String(div.id) : null,
    department: dept?.id ? [String(dept.id)] : null,
  };
};

const deriveApprovedStepAndCompensation = (source) => {
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

const EMPLOYEE_TYPE_PREFIXES = {
  Plantilla: "RMBGH-",
  "Contract of Service": "CT-",
  Consultant: "CS-",
};

const applyEmployeeNumberPrefix = (currentValue, type) => {
  const prefix = EMPLOYEE_TYPE_PREFIXES[type] ?? "";
  let base = currentValue ?? "";
  for (const p of Object.values(EMPLOYEE_TYPE_PREFIXES)) {
    if (base.startsWith(p)) {
      base = base.slice(p.length);
      break;
    }
  }
  return prefix + base;
};

// ─── Loader components ────────────────────────────────────────────────────────
function FormLoader({ label = "Loading employee data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-xs font-semibold uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EmployeeForm({ employee, refresh, onClose }) {
  const [activeTab, setActiveTab] = useState("employment");

  const initialState = {
    employeeNumber: "",
    rolePosition: [],
    employeeType: "Plantilla",
    status: "",
    designation: [],
    division: "",
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    title: [],
    gender: "",
    department: [],
    plantillaPositionId: "",
    stepIncrementId: "",
    stepNumber: "",
    sgLevel: "",
    annualSalary: "",
    monthlySalary: "",
    salaryOverride: false,
    cosPositionId: "",
    consultantPositionId: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [departments, setDepartments] = useState([]);
  const [allDivisions, setAllDivisions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [steps, setSteps] = useState([]);
  const [cosPositions, setCosPositions] = useState([]);
  const [consultantPositions, setConsultantPositions] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPositionLabel, setSelectedPositionLabel] = useState("");
  const [selectedStepLabel, setSelectedStepLabel] = useState("");
  const [salaryInputSource, setSalaryInputSource] = useState(null);
  const fileInputRef = useRef(null);
  const hasHydratedRef = useRef(false);
  const prevEmployeeTypeRef = useRef(formData.employeeType);
  const [pendingProvision, setPendingProvision] = useState(null);
  const provisionAppliedRef = useRef(false);
  const loadedEmployeeIdRef = useRef(undefined);

  // ── Loading states ──────────────────────────────────────────────────────
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pdsValues, setPdsValues] = useState({});
  const [pdsStepIdx, setPdsStepIdx] = useState(0);

  const pdsStep = STEPS[pdsStepIdx];
  const PdsStepComponent = PDS_STEP_COMPONENTS[pdsStep?.id];
  const setPdsField = (key, val) =>
    setPdsValues((prev) => ({ ...prev, [key]: val }));

  const selectedDepartment = departments.find(
    (d) =>
      Array.isArray(formData.department) &&
      formData.department.includes(String(d.id)),
  );

  // ─── Salary helpers ──────────────────────────────────────────────────────
  const toNumber = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleAnnualSalaryChange = (raw) => {
    setSalaryInputSource("annual");
    const n = toNumber(raw);
    setFormData((prev) => ({
      ...prev,
      annualSalary: raw,
      monthlySalary: n !== null ? (n / 12).toFixed(2) : prev.monthlySalary,
    }));
  };

  const handleMonthlySalaryChange = (raw) => {
    setSalaryInputSource("monthly");
    const n = toNumber(raw);
    setFormData((prev) => ({
      ...prev,
      monthlySalary: raw,
      annualSalary: n !== null ? (n * 12).toFixed(2) : prev.annualSalary,
    }));
  };

  // ─── Effects ─────────────────────────────────────────────────────────────
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
          employeeNumber: employee.employee_number ?? "",
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
          annualSalary:
            employee.annual_salary != null
              ? String(employee.annual_salary)
              : "",
          monthlySalary:
            employee.monthly_salary != null
              ? String(employee.monthly_salary)
              : "",
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

          finalFormData = {
            ...finalFormData,
            employeeType: "Plantilla",
            plantillaPositionId: String(pos.id),
            stepIncrementId: "",
            stepNumber: "",
            sgLevel: pos.salary_grade
              ? String(pos.salary_grade)
              : finalFormData.sgLevel,
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

  useEffect(() => {
    employeeService
      .getDivisions()
      .then((res) => setAllDivisions(res.data ?? res));
  }, []);

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

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));

  const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const up = (v) => (v ? String(v).toUpperCase() : "");
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

    const PDS_TABLE_KEYS = [
      "children",
      "edu_elementary",
      "edu_secondary",
      "edu_vocational",
      "edu_college",
      "edu_graduate",
      "eligibilities",
      "work_experiences",
      "voluntary_works",
      "trainings",
      "special_skills",
      "non_academic_distinctions",
      "organization_memberships",
      "references",
    ];

    Object.entries(pdsValues).forEach(([key, val]) => {
      if (PDS_TABLE_KEYS.includes(key)) {
        if (Array.isArray(val) && val.length > 0)
          form.append(`pds_${key}`, JSON.stringify(val));
      } else if (val !== null && val !== undefined && val !== "") {
        form.append(`pds_${key}`, val);
      }
    });

    try {
      if (employee) {
        await employeeService.updateEmployee(employee.id, form);
        toast.success("Employee updated");
      } else {
        const response = await employeeService.addEmployee(form);
        const newEmployeeId = response.id || response.data?.id;
        if (newEmployeeId && formData.department?.[0]) {
          try {
            await employeeService.createDepartmentAssignment(newEmployeeId, {
              department_id: formData.department[0],
              is_primary: true,
              start_date: new Date().toISOString().split("T")[0],
            });
          } catch (err) {
            console.error("Failed to create department assignment:", err);
          }
        }
        toast.success("Employee added");
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message ?? "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────
  const selectedPosition =
    Array.isArray(positions) && positions.length > 0
      ? positions.find(
          (p) => String(p.id) === String(formData.plantillaPositionId),
        )
      : null;
  const positionTitle =
    selectedPosition?.position_title ?? selectedPosition?.title ?? "";

  const selectedCosPosition =
    Array.isArray(cosPositions) && cosPositions.length > 0
      ? cosPositions.find(
          (p) => String(p.id) === String(formData.cosPositionId),
        )
      : null;

  const selectedConsultantPosition =
    Array.isArray(consultantPositions) && consultantPositions.length > 0
      ? consultantPositions.find(
          (p) => String(p.id) === String(formData.consultantPositionId),
        )
      : null;

  const activePositionLabel =
    formData.employeeType === "Plantilla"
      ? positionTitle
      : formData.employeeType === "Contract of Service"
        ? (selectedCosPosition?.title ?? "")
        : formData.employeeType === "Consultant"
          ? (selectedConsultantPosition?.title ?? "")
          : "";

  const displayName =
    [formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
    "New Employee";
  const initials =
    [formData.firstName?.[0] ?? "", formData.lastName?.[0] ?? ""]
      .join("")
      .toUpperCase() || "?";
  const departmentName = selectedDepartment?.name ?? "";
  const roleDisplay =
    (Array.isArray(formData.rolePosition)
      ? formData.rolePosition
      : [formData.rolePosition]
    )
      .filter(Boolean)
      .join(", ") || "No role assigned";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col bg-white w-full relative"
      style={{ maxHeight: "90vh", fontFamily: "inherit" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
        {/* Avatar */}
        <div
          className="relative group flex-shrink-0"
          style={{ width: 52, height: 52 }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-400 transition-all duration-150"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleAvatarFile(e.dataTransfer.files[0]);
            }}
            style={{
              boxShadow: isDragging ? "0 0 0 3px rgba(0,0,0,0.15)" : undefined,
            }}
          >
            {(avatarPreview ?? employee?.avatar_url) ? (
              <img
                src={avatarPreview ?? employee.avatar_url}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-sm font-medium text-gray-500 select-none uppercase">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          {(avatarPreview ?? employee?.avatar_url) && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarFile(e.target.files[0])}
          />
        </div>

        {/* Name / role */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide truncate leading-tight">
            {displayName}
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5 truncate">
            {roleDisplay}
            {departmentName ? ` · ${departmentName}` : ""}
          </p>
          {activePositionLabel && (
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5 truncate font-medium">
              {activePositionLabel}
            </p>
          )}
        </div>

        {/* Employee number + status badge */}
        <div className="flex-shrink-0 text-right space-y-1.5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
              Employee No.
            </p>
            <p className="text-sm font-semibold text-gray-900 tracking-wide">
              {formData.employeeNumber || "—"}
            </p>
          </div>
          {formData.status && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full",
                formData.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700"
                  : formData.status === "INACTIVE"
                    ? "bg-gray-100 text-gray-500"
                    : "bg-red-50 text-red-600",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  formData.status === "ACTIVE"
                    ? "bg-emerald-500"
                    : formData.status === "INACTIVE"
                      ? "bg-gray-400"
                      : "bg-red-500",
                )}
              />
              {formData.status}
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-100 px-6 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "py-3 mr-6 text-xs font-semibold uppercase tracking-widest border-b-2 -mb-px transition-colors duration-150",
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 px-6 py-6 space-y-8">
        {initializing ? (
          <FormLoader
            label={employee ? "Loading employee data..." : "Preparing form..."}
          />
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════════
                TAB: EMPLOYMENT
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "employment" && (
              <>
                {/* ── Employee Information ─────────────────────────────────── */}
                <FormSection label="Employee information">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FieldSelect
                      label="Employee No."
                      className="sm:col-span-1"
                      custom
                    >
                      <input
                        type="text"
                        value={formData.employeeNumber}
                        onChange={(e) =>
                          handleChange("employeeNumber", e.target.value)
                        }
                        className="field-input"
                      />
                    </FieldSelect>

                    <FieldSelect label="Prefix">
                      <NativeSelect
                        value={formData.prefix}
                        onChange={(v) => handleChange("prefix", v)}
                        options={[
                          "MR.",
                          "MS.",
                          "MRS.",
                          "DR.",
                          "ENGR.",
                          "ATTY.",
                          "HON.",
                        ]}
                        placeholder="—"
                      />
                    </FieldSelect>

                    <FieldSelect
                      label="First name"
                      className="sm:col-span-1"
                      custom
                    >
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                        className="field-input"
                      />
                    </FieldSelect>

                    <FieldSelect
                      label="Middle name"
                      className="sm:col-span-1"
                      custom
                    >
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) =>
                          handleChange("middleName", e.target.value)
                        }
                        className="field-input"
                      />
                    </FieldSelect>

                    <FieldSelect
                      label="Last name"
                      className="sm:col-span-1"
                      custom
                    >
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        className="field-input"
                      />
                    </FieldSelect>

                    <FieldSelect label="Suffix">
                      <NativeSelect
                        value={formData.suffix}
                        onChange={(v) => handleChange("suffix", v)}
                        options={["JR.", "SR.", "II", "III", "IV"]}
                        placeholder="—"
                      />
                    </FieldSelect>

                    <FieldSelect
                      label="Title / profession"
                      className="sm:col-span-2"
                      custom
                    >
                      <MultiCombobox
                        value={formData.title}
                        onChange={(v) => handleChange("title", v)}
                        placeholder="Select titles"
                        options={[
                          "MD",
                          "RN",
                          "RM",
                          "CPA",
                          "RND",
                          "RSW",
                          "MAN",
                          "DBA",
                          "RMT",
                          "RPH",
                          "RADT",
                          "RRT",
                          "RTRP",
                          "PT",
                          "OT",
                          "SLP",
                          "ND",
                          "DMD",
                          "DPBS",
                          "DPBO",
                          "DPBU",
                          "DPIM",
                          "DPOGS",
                          "FPCS",
                          "FPSGS",
                          "FPAO",
                          "FPUA",
                          "FPCR",
                          "FICS",
                          "FPOA",
                          "FPALES",
                          "MBA",
                          "MHM",
                          "MMHOA",
                          "MPH",
                          "MET III",
                          "HD TECHNICIAN",
                        ].map((v) => ({ value: v, label: v }))}
                      />
                    </FieldSelect>
                  </div>
                </FormSection>

                {/* ── Employment Information ────────────────────────────────── */}
                <FormSection label="Employment information">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <FieldSelect
                      label="Position classification"
                      className="sm:col-span-1"
                      custom
                    >
                      <MultiCombobox
                        value={formData.rolePosition}
                        onChange={(v) => handleChange("rolePosition", v)}
                        placeholder="Select classification"
                        options={[
                          "CHIEF",
                          "DIRECTOR",
                          "ASSISTANT DIRECTOR",
                          "OFFICER IN CHARGE",
                          "COMMITTEE",
                          "CHAIRMAN",
                          "HEAD",
                          "SUPERVISOR",
                          "STAFF",
                        ].map((v) => ({ value: v, label: v }))}
                      />
                    </FieldSelect>

                    <FieldSelect label="Sex">
                      <NativeSelect
                        value={formData.gender}
                        onChange={(v) => handleChange("gender", v)}
                        options={["MALE", "FEMALE"]}
                        placeholder="Select sex"
                      />
                    </FieldSelect>

                    <FieldSelect label="Division" custom>
                      <SingleCombobox
                        value={formData.division}
                        onChange={(v) => handleChange("division", v)}
                        placeholder="Select division"
                        options={allDivisions.map((d) => ({
                          value: String(d.id),
                          label: d.name,
                        }))}
                      />
                    </FieldSelect>

                    <FieldSelect label="Department" custom>
                      <MultiCombobox
                        value={formData.department}
                        onChange={(v) => handleChange("department", v)}
                        placeholder="Select department"
                        options={departments.map((d) => ({
                          value: String(d.id),
                          label: d.name,
                        }))}
                      />
                    </FieldSelect>

                    <FieldSelect label="Deployment area" custom>
                      <MultiCombobox
                        value={formData.designation}
                        onChange={(v) => handleChange("designation", v)}
                        placeholder="Select area"
                        options={departments.map((d) => ({
                          value: d.name.toUpperCase(),
                          label: d.name.toUpperCase(),
                        }))}
                      />
                    </FieldSelect>

                    <FieldSelect label="Status">
                      <NativeSelect
                        value={formData.status}
                        onChange={(v) => handleChange("status", v)}
                        options={["ACTIVE", "INACTIVE", "RESIGN"]}
                        placeholder="Select status"
                      />
                    </FieldSelect>
                  </div>
                  {pendingProvision?.pending && (
                    <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 normal-case">
                      This employee has a <strong>Completed</strong> application
                      for <strong>{pendingProvision.posting_title}</strong>. The
                      Employee Type and Position have been automatically filled
                      in — please review and save to proceed with provisioning.
                    </div>
                  )}
                  {/* Employee type pills */}
                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      Employee type
                    </p>
                    <div className="flex gap-2">
                      {EMPLOYEE_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              employeeType: t.value,
                              employeeNumber: applyEmployeeNumberPrefix(
                                prev.employeeNumber,
                                t.value,
                              ),
                            }))
                          }
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-150",
                            formData.employeeType === t.value
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-700",
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compensation block — applies to all employment types */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Compensation
                      </p>
                      {formData.employeeType === "Plantilla" && (
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.salaryOverride}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                salaryOverride: e.target.checked,
                              }))
                            }
                            className="w-3.5 h-3.5 rounded border-gray-300"
                          />
                          Override computed salary
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FieldSelect label="Gross salary" custom>
                        <CurrencyInput
                          value={formData.monthlySalary}
                          onChange={handleMonthlySalaryChange}
                          readOnly={
                            formData.employeeType === "Plantilla" &&
                            !formData.salaryOverride
                          }
                          className={cn(
                            "field-input",
                            formData.employeeType === "Plantilla" &&
                              !formData.salaryOverride &&
                              "bg-gray-100 text-gray-500 cursor-default",
                          )}
                        />
                      </FieldSelect>

                      <FieldSelect label="Annual salary" custom>
                        <CurrencyInput
                          value={formData.annualSalary}
                          onChange={handleAnnualSalaryChange}
                          readOnly={
                            formData.employeeType === "Plantilla" &&
                            !formData.salaryOverride
                          }
                          className={cn(
                            "field-input",
                            formData.employeeType === "Plantilla" &&
                              !formData.salaryOverride &&
                              "bg-gray-100 text-gray-500 cursor-default",
                          )}
                        />
                      </FieldSelect>
                    </div>

                    {formData.employeeType === "Plantilla" &&
                      !formData.salaryOverride && (
                        <p className="text-[10px] text-gray-400 normal-case">
                          Auto-computed from the assigned position's step
                          increment. Check "Override computed salary" to enter a
                          custom amount.
                        </p>
                      )}
                  </div>

                  {/* Plantilla block */}
                  {formData.employeeType === "Plantilla" && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Plantilla position details
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FieldSelect
                          label="Position slot"
                          className="sm:col-span-2"
                          custom
                        >
                          <SingleCombobox
                            value={formData.plantillaPositionId}
                            displayLabel={selectedPositionLabel}
                            onChange={handlePositionChange}
                            placeholder="Select position"
                            options={
                              Array.isArray(positions)
                                ? positions
                                    .filter(
                                      (pos) =>
                                        pos.is_assignable ||
                                        pos.is_current_employee ||
                                        String(pos.id) ===
                                          String(formData.plantillaPositionId),
                                    )
                                    .map((pos) => ({
                                      value: String(pos.id),
                                      label: positionLabel(pos),
                                      disabled:
                                        !pos.is_assignable &&
                                        !pos.is_current_employee,
                                    }))
                                : []
                            }
                          />
                        </FieldSelect>

                        <FieldSelect label="Salary grade" custom>
                          <div className="field-input flex items-center bg-gray-100 text-gray-500 cursor-default">
                            {formData.sgLevel ? `SG ${formData.sgLevel}` : "—"}
                          </div>
                        </FieldSelect>

                        <FieldSelect label="Step increment" custom>
                          <div className="field-input flex items-center bg-gray-100 text-gray-500 cursor-default">
                            {selectedStepLabel ||
                              (!formData.plantillaPositionId
                                ? "Select a position first"
                                : "—")}
                          </div>
                        </FieldSelect>
                      </div>
                    </div>
                  )}

                  {/* COS block */}
                  {formData.employeeType === "Contract of Service" && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Contract of service position
                      </p>
                      <FieldSelect label="COS position" custom>
                        <SingleCombobox
                          value={formData.cosPositionId}
                          onChange={(v) => handleChange("cosPositionId", v)}
                          placeholder="Select COS position"
                          options={
                            Array.isArray(cosPositions)
                              ? cosPositions.map((p) => ({
                                  value: String(p.id),
                                  label: p.title.toUpperCase(),
                                }))
                              : []
                          }
                        />
                      </FieldSelect>
                    </div>
                  )}

                  {/* Consultant block */}
                  {formData.employeeType === "Consultant" && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Consultant position
                      </p>
                      <FieldSelect label="Consultant position" custom>
                        <SingleCombobox
                          value={formData.consultantPositionId}
                          onChange={(v) =>
                            handleChange("consultantPositionId", v)
                          }
                          placeholder="Select consultant position"
                          options={
                            Array.isArray(consultantPositions)
                              ? consultantPositions.map((p) => ({
                                  value: String(p.id),
                                  label: p.title.toUpperCase(),
                                }))
                              : []
                          }
                        />
                      </FieldSelect>
                    </div>
                  )}
                </FormSection>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB: PERSONAL DATA SHEET
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "pds" && (
              <div className="space-y-5">
                {/* Step pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPdsStepIdx(i)}
                      className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider transition-all duration-150 border",
                        i === pdsStepIdx
                          ? "bg-gray-900 text-white border-gray-900"
                          : i < pdsStepIdx
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-gray-400 border-gray-200 hover:border-gray-400",
                      )}
                    >
                      {i + 1}. {s.short}
                    </button>
                  ))}
                </div>

                {/* Step heading */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {pdsStepIdx + 1}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {pdsStep?.label}
                  </p>
                </div>

                {/* Step content */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  {PdsStepComponent && (
                    <PdsStepComponent v={pdsValues} set={setPdsField} fe={{}} />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setPdsStepIdx((i) => Math.max(0, i - 1))}
                    disabled={pdsStepIdx === 0}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default transition-all duration-150"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPdsStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
                    }
                    disabled={pdsStepIdx === STEPS.length - 1}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default transition-all duration-150"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer / Submit ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || initializing}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {employee ? "Update employee" : "Add employee"}
            </>
          )}
        </button>
      </div>

      {/* ── Submitting overlay ───────────────────────────────────────────────── */}
      {submitting && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-widest">
              Saving employee...
            </p>
          </div>
        </div>
      )}

      {/* ── Inline styles ─────────────────────────────────────────────────────── */}
      <style>{`
        .field-input {
          display: flex;
          align-items: center;
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
          text-transform: uppercase;
          color: #111827;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
        }
        .field-input:focus {
          border-color: #9ca3af;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }
        .field-input::placeholder {
          color: #d1d5db;
          text-transform: none;
        }
      `}</style>
    </form>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FormSection({ label, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap">
          {label}
        </p>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </section>
  );
}

function FieldSelect({ label, children, className = "", custom = false }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function NativeSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field-input cursor-pointer appearance-none"
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: 36,
        padding: "0 10px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontSize: 12,
        fontFamily: "inherit",
        textTransform: "uppercase",
        color: "#111827",
        background: "white",
        outline: "none",
        letterSpacing: "0.02em",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ─── Currency input (live comma formatting, cursor-position safe) ─────────────
function CurrencyInput({
  value,
  onChange,
  readOnly = false,
  className = "field-input",
}) {
  const inputRef = useRef(null);

  const formatDisplay = (raw) => {
    if (raw === "" || raw === null || raw === undefined) return "";
    const parts = String(raw).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
  };

  const handleChange = (e) => {
    const input = e.target;
    const prevValue = input.value;
    const cursorPos = input.selectionStart;

    // Count digits before cursor in the old (formatted) string
    const digitsBeforeCursor = prevValue
      .slice(0, cursorPos)
      .replace(/[^0-9]/g, "").length;

    // Strip everything except digits and a single decimal point
    let raw = prevValue.replace(/[^0-9.]/g, "");
    const firstDot = raw.indexOf(".");
    if (firstDot !== -1) {
      raw =
        raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
    }

    onChange(raw);

    // Restore cursor position after re-render
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const newFormatted = formatDisplay(raw);
      let count = 0;
      let pos = newFormatted.length;
      for (let i = 0; i < newFormatted.length; i++) {
        if (/[0-9]/.test(newFormatted[i])) count++;
        if (count === digitsBeforeCursor) {
          pos = i + 1;
          break;
        }
      }
      inputRef.current.setSelectionRange(pos, pos);
    });
  };

  const handleBlur = () => {
    if (value === "" || value === null || value === undefined) return;
    const num = Number(value);
    if (!isNaN(num)) {
      onChange(num.toFixed(2));
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={formatDisplay(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      readOnly={readOnly}
      className={className}
    />
  );
}

function SingleCombobox({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  displayLabel,
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const label = displayLabel || selectedOption?.label || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "field-input justify-between cursor-pointer hover:border-gray-400",
            !label && "text-gray-300",
          )}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: 36,
            padding: "0 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "inherit",
            textTransform: "uppercase",
            color: label ? "#111827" : "#d1d5db",
            background: "white",
            outline: "none",
            letterSpacing: "0.02em",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span className="truncate">{label || placeholder}</span>
          <ChevronsUpDown className="w-3 h-3 opacity-40 flex-shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)", minWidth: 200 }}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="max-h-56">
          <CommandInput placeholder={`Search...`} className="text-xs" />
          <CommandEmpty className="text-xs py-3 text-center text-gray-400">
            No results found
          </CommandEmpty>
          <div className="overflow-y-auto max-h-44 overscroll-contain">
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  disabled={opt.disabled}
                  className={cn(
                    "uppercase text-xs",
                    opt.disabled && "opacity-40 pointer-events-none",
                  )}
                  onSelect={() => {
                    if (!opt.disabled) {
                      onChange(opt.value === value ? "" : opt.value);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 w-3.5 h-3.5 flex-shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                  {opt.disabled && (
                    <span className="ml-auto text-[10px] text-gray-300 normal-case">
                      Occupied
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function MultiCombobox({ value = [], onChange, options = [], placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [value].filter(Boolean);
  const selectedLabels = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label);

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minHeight: 36,
              padding: "0 10px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "inherit",
              textTransform: "uppercase",
              color: selectedLabels.length ? "#111827" : "#d1d5db",
              background: "white",
              outline: "none",
              letterSpacing: "0.02em",
              cursor: "pointer",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span className="truncate">
              {selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : placeholder}
            </span>
            <ChevronsUpDown className="w-3 h-3 opacity-40 flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: "var(--radix-popover-trigger-width)", minWidth: 200 }}
          onWheel={(e) => e.stopPropagation()}
        >
          <Command className="max-h-56">
            <CommandInput placeholder="Search..." className="text-xs" />
            <CommandEmpty className="text-xs py-3 text-center text-gray-400">
              No results
            </CommandEmpty>
            <div className="overflow-y-auto max-h-44 overscroll-contain">
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    className="uppercase text-xs"
                    onSelect={() => toggle(opt.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 w-3.5 h-3.5 flex-shrink-0",
                        selected.includes(opt.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200"
              >
                {opt?.label ?? v}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={`Remove ${opt?.label ?? v}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
