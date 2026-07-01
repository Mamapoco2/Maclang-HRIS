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
  Plus,
  Trash2,
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
    cosPositionId: "",
    consultantPositionId: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [parents, setParents] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
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
  const fileInputRef = useRef(null);
  const isInitialMount = useRef(true);

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
    const fetchAndInit = async () => {
      setInitializing(true);
      try {
        const [dept, positionList] = await Promise.all([
          employeeService.getDepartments(),
          employeeService.getAssignablePositions(employee?.id ?? null),
        ]);
        const deptList = dept.data ?? dept;
        const validDeptIds = deptList.map((d) => String(d.id));
        setDepartments(deptList);
        setPositions(Array.isArray(positionList) ? positionList : []);

        if (!employee) return;

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
        const step =
          assignment?.step_increment ?? assignment?.stepIncrement ?? null;
        const sgValue =
          position?.salary_grade?.salary_grade ??
          position?.salaryGrade?.salary_grade ??
          "";
        const annualSalaryValue =
          step?.annual_salary ??
          position?.salary_grade?.annual_salary ??
          position?.salaryGrade?.annual_salary ??
          "";

        setSelectedPositionLabel(positionLabel(position));

        const toUpperArray = (val) =>
          (Array.isArray(val) ? val : val ? [val] : []).map((v) =>
            String(v).toUpperCase(),
          );

        setFormData({
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
          employeeType: normalizeEmployeeType(employee.employment_type),
          status: employee.employment_status
            ? String(employee.employment_status).toUpperCase()
            : "",
          plantillaPositionId: position?.id ? String(position.id) : "",
          stepIncrementId: step?.id ? String(step.id) : "",
          stepNumber: step?.step != null ? String(step.step) : "",
          sgLevel: sgValue ? String(sgValue) : "",
          annualSalary: annualSalaryValue ?? "",
          cosPositionId: employee.cos_position_id
            ? String(employee.cos_position_id)
            : "",
          consultantPositionId: employee.consultant_position_id
            ? String(employee.consultant_position_id)
            : "",
        });

        if (employee.parents?.length) {
          setParents(employee.parents.map((p) => ({ parentId: String(p.id) })));
        } else {
          setParents([]);
        }

        if (employee.profile) setPdsValues(employee.profile);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employee data.");
      } finally {
        setInitializing(false);
      }
    };
    fetchAndInit();
  }, [employee]);

  useEffect(() => {
    employeeService
      .getDivisions()
      .then((res) => setAllDivisions(res.data ?? res));
  }, []);

  useEffect(() => {
    employeeService.getAllEmployees().then((res) => setAllEmployees(res.data));
  }, []);

  useEffect(() => {
    if (
      !formData.plantillaPositionId ||
      !Array.isArray(positions) ||
      positions.length === 0
    ) {
      if (!formData.plantillaPositionId) {
        setSteps([]);
        setFormData((prev) => ({
          ...prev,
          stepIncrementId: "",
          stepNumber: "",
          sgLevel: "",
          annualSalary: "",
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
      setFormData((prev) => ({ ...prev, sgLevel: sg ? String(sg) : "" }));
    }
    employeeService
      .getStepsByPosition(formData.plantillaPositionId)
      .then((res) => {
        const loaded = res ?? [];
        setSteps(loaded);
        setFormData((prev) => {
          if (!prev.stepIncrementId || prev.stepNumber) return prev;
          const match = loaded.find(
            (s) => String(s.id) === String(prev.stepIncrementId),
          );
          return match ? { ...prev, stepNumber: String(match.step) } : prev;
        });
      })
      .catch(() => setSteps([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.plantillaPositionId, positions]);

  useEffect(() => {
    if (!formData.stepIncrementId) return;
    const step = steps.find(
      (s) => String(s.id) === String(formData.stepIncrementId),
    );
    if (!step) return;
    setFormData((prev) => ({
      ...prev,
      annualSalary: step.annual_salary ?? "",
      stepNumber: String(step.step),
    }));
  }, [formData.stepIncrementId, steps]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (formData.employeeType !== "Plantilla") {
      setFormData((prev) => ({
        ...prev,
        plantillaPositionId: "",
        stepIncrementId: "",
        stepNumber: "",
        sgLevel: "",
        annualSalary: "",
      }));
      setSelectedPositionLabel("");
      setSteps([]);
    }
    if (formData.employeeType !== "Contract of Service")
      setFormData((prev) => ({ ...prev, cosPositionId: "" }));
    if (formData.employeeType !== "Consultant")
      setFormData((prev) => ({ ...prev, consultantPositionId: "" }));
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
    setSelectedPositionLabel(positionLabel(pos));
    setFormData((prev) => ({
      ...prev,
      plantillaPositionId: id,
      sgLevel: sg ? String(sg) : "",
      stepIncrementId: "",
      stepNumber: "",
      annualSalary: "",
    }));
  };

  const addParent = () => setParents((prev) => [...prev, { parentId: "" }]);
  const updateParent = (index, value) => {
    setParents((prev) =>
      prev.map((p, i) => (i === index ? { ...p, parentId: value } : p)),
    );
    setOpenIndex(null);
  };
  const removeParent = (index) =>
    setParents((prev) => prev.filter((_, i) => i !== index));

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

    form.append("_sync_parents", "1");
    parents
      .filter((p) => p.parentId)
      .forEach((p) => form.append("parent_ids[]", p.parentId));

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
  const parentCandidates = allEmployees.filter(
    (emp) => emp.id !== employee?.id,
  );

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

                    <FieldSelect label="Annual salary" custom>
                      <input
                        type="number"
                        value={formData.annualSalary}
                        onChange={(e) =>
                          handleChange("annualSalary", e.target.value)
                        }
                        className="field-input"
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
                          onClick={() => handleChange("employeeType", t.value)}
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
                          <SingleCombobox
                            value={formData.stepIncrementId}
                            onChange={(v) => handleChange("stepIncrementId", v)}
                            placeholder={
                              !formData.plantillaPositionId
                                ? "Select a position first"
                                : steps.length === 0
                                  ? "No steps available"
                                  : "Select step"
                            }
                            disabled={
                              !formData.plantillaPositionId ||
                              steps.length === 0
                            }
                            options={steps.map((s) => ({
                              value: String(s.id),
                              label: `Step ${s.step}`,
                            }))}
                          />
                        </FieldSelect>

                        <FieldSelect
                          label="Annual salary"
                          className="sm:col-span-2"
                          custom
                        >
                          <input
                            type="text"
                            value={formData.annualSalary}
                            readOnly
                            className="field-input bg-gray-100 text-gray-500 cursor-default"
                          />
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

                {/* ── Parent Assignment ──────────────────────────────────────── */}
                <FormSection label="Parent assignment">
                  <div className="space-y-2 mb-3">
                    {parents.map((parent, index) => {
                      const selectedEmployee = parentCandidates.find(
                        (emp) => String(emp.id) === parent.parentId,
                      );
                      return (
                        <div key={index} className="flex gap-2 items-center">
                          <Popover
                            open={openIndex === index}
                            onOpenChange={(open) =>
                              setOpenIndex(open ? index : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "flex-1 field-input flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors",
                                  !selectedEmployee && "text-gray-400",
                                )}
                              >
                                <span className="truncate uppercase text-sm">
                                  {selectedEmployee
                                    ? selectedEmployee.full_name
                                    : "Select employee"}
                                </span>
                                <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 flex-shrink-0 ml-2" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-0">
                              <Command>
                                <CommandInput placeholder="Search employee..." />
                                <CommandEmpty>No employee found.</CommandEmpty>
                                <CommandGroup className="max-h-56 overflow-y-auto">
                                  {parentCandidates
                                    .filter(
                                      (emp) =>
                                        !parents
                                          .map((p) => p.parentId)
                                          .includes(String(emp.id)) ||
                                        String(emp.id) === parent.parentId,
                                    )
                                    .map((emp) => (
                                      <CommandItem
                                        key={emp.id}
                                        value={emp.full_name}
                                        className="uppercase"
                                        onSelect={() =>
                                          updateParent(index, String(emp.id))
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 w-4 h-4 flex-shrink-0",
                                            parent.parentId === String(emp.id)
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {emp.full_name}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <button
                            type="button"
                            onClick={() => removeParent(index)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150 flex-shrink-0"
                            aria-label="Remove parent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={addParent}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-700 border border-dashed border-gray-200 hover:border-gray-400 rounded-lg px-3 py-2 transition-all duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add parent
                  </button>
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
