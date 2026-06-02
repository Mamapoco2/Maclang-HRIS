import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeService } from "@/services/employeeService";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Camera, X } from "lucide-react";
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

// ─── Normalize employment_type from API to match form option values ───────────
const normalizeEmployeeType = (raw) => {
  const map = {
    plantilla: "Plantilla",
    "contract of service": "Contract of Service",
    cos: "Contract of Service",
    consultant: "Consultant",
  };
  return map[(raw ?? "").toLowerCase().trim()] ?? raw ?? "Plantilla";
};

// ─── Build a human-readable label for a plantilla position ───────────────────
// Uses position_slot_name (e.g. "22" or "23-1") + position_title / title
const positionLabel = (pos) => {
  if (!pos) return "";
  const slot = pos.position_slot_name ?? pos.item_number ?? "";
  const title = pos.position_title ?? pos.title ?? "";
  return slot && title ? `${slot} — ${title}` : slot || title;
};

export default function EmployeeForm({ employee, refresh, onClose }) {
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

  const selectedDepartment = departments.find(
    (d) =>
      Array.isArray(formData.department) &&
      formData.department.includes(String(d.id)),
  );

  // ─── Fetch COS + Consultant positions on mount ────────────────────────────
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

  // ─── Fetch plantilla positions + departments on mount ─────────────────────
  useEffect(() => {
    const fetchAndInit = async () => {
      try {
        const [dept, positionList] = await Promise.all([
          employeeService.getDepartments(),
          employeeService.getAssignablePositions(employee?.id ?? null),
        ]);

        const deptList = dept.data ?? dept;
        const validDeptIds = deptList.map((d) => String(d.id));
        setDepartments(deptList);
        // getAssignablePositions now always returns a plain array
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

        // Build the display label from position_slot_name + position_title
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
      } catch (err) {
        console.error(err);
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

  // ─── Load steps when position slot changes ────────────────────────────────
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

  // ─── Update salary + stepNumber when step changes ─────────────────────────
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

  // ─── Clear fields when type changes (skip on initial mount) ──────────────
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
    if (formData.employeeType !== "Contract of Service") {
      setFormData((prev) => ({ ...prev, cosPositionId: "" }));
    }
    if (formData.employeeType !== "Consultant") {
      setFormData((prev) => ({ ...prev, consultantPositionId: "" }));
    }
  }, [formData.employeeType]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
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

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  const parentCandidates = allEmployees.filter(
    (emp) => emp.id !== employee?.id,
  );

  // ─── Derived display values ───────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="max-h-[90vh] overflow-y-auto sm:p-6 lg:p-8 bg-white w-full space-y-6"
    >
      <div className="border-b">
        <h2 className="text-xl sm:text-2xl font-bold uppercase">
          {employee ? "Edit Employee" : "New Employee"}
        </h2>
      </div>

      {/* ── Avatar ── */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b pb-6">
        <div className="relative group flex-shrink-0">
          <div
            className={cn(
              "h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden cursor-pointer transition-all duration-200 ring-2",
              isDragging
                ? "ring-black ring-offset-2 scale-105"
                : "ring-gray-200 hover:ring-black hover:ring-offset-2",
            )}
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
          >
            {(avatarPreview ?? employee?.avatar_url) ? (
              <img
                src={avatarPreview ?? employee.avatar_url}
                className="h-full w-full object-cover"
                alt="avatar"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-2xl font-bold text-gray-400 select-none">
                {formData.firstName?.[0] ?? ""}
                {formData.lastName?.[0] ?? ""}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 pointer-events-none">
              <Camera className="h-5 w-5 text-white" />
              <span className="text-[10px] text-white font-medium tracking-wide">
                {(avatarPreview ?? employee?.avatar_url) ? "Change" : "Upload"}
              </span>
            </div>
          </div>

          {(avatarPreview ?? employee?.avatar_url) && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute -top-0.5 -right-0.5 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
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

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-semibold truncate uppercase">
            {formData.firstName || "First"} {formData.lastName || "Last"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5 uppercase">
            {(Array.isArray(formData.rolePosition)
              ? formData.rolePosition
              : [formData.rolePosition]
            )
              .filter(Boolean)
              .join(", ") || "No Position Assigned"}
            {selectedDepartment
              ? `, ${selectedDepartment.name}`
              : ", Department"}
          </p>
          {activePositionLabel ? (
            <p className="text-xs text-gray-400 mt-0.5 uppercase font-medium tracking-wide">
              {activePositionLabel}
            </p>
          ) : null}
          <p className="text-xs mt-2">
            {avatarFile ? (
              <span className="text-emerald-600 font-medium">
                ✓ {avatarFile.name}
              </span>
            ) : (
              <span className="text-gray-400">
                Click photo to upload · or drag & drop
              </span>
            )}
          </p>
        </div>
      </section>

      {/* ── Employee Information ── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase border-b pb-2">
          Employee Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <InputField
            label="Employee Number"
            value={formData.employeeNumber}
            onChange={(v) => handleChange("employeeNumber", v)}
          />
          <SearchableSelect
            label="Prefix"
            value={formData.prefix}
            placeholder="Select prefix"
            options={[
              { value: "MR.", label: "MR." },
              { value: "MS.", label: "MS." },
              { value: "MRS.", label: "MRS." },
              { value: "DR.", label: "DR." },
              { value: "ENGR.", label: "ENGR." },
              { value: "ATTY.", label: "ATTY." },
              { value: "HON.", label: "HON." },
            ]}
            onChange={(v) => handleChange("prefix", v)}
          />
          <InputField
            label="First Name"
            value={formData.firstName}
            onChange={(v) => handleChange("firstName", v)}
          />
          <InputField
            label="Middle Name"
            value={formData.middleName}
            onChange={(v) => handleChange("middleName", v)}
          />
          <InputField
            label="Last Name"
            value={formData.lastName}
            onChange={(v) => handleChange("lastName", v)}
          />
          <SearchableSelect
            label="Suffix"
            value={formData.suffix}
            placeholder="Select suffix"
            options={[
              { value: "JR.", label: "JR." },
              { value: "SR.", label: "SR." },
              { value: "II", label: "II" },
              { value: "III", label: "III" },
              { value: "IV", label: "IV" },
            ]}
            onChange={(v) => handleChange("suffix", v)}
          />
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
            <SearchableSelect
              label="Title / Profession"
              value={formData.title}
              placeholder="Select title"
              multiple
              options={[
                { value: "MD", label: "MD" },
                { value: "RN", label: "RN" },
                { value: "RM", label: "RM" },
                { value: "CPA", label: "CPA" },
                { value: "RND", label: "RND" },
                { value: "RSW", label: "RSW" },
                { value: "MAN", label: "MAN" },
                { value: "DBA", label: "DBA" },
                { value: "RMT", label: "RMT" },
                { value: "RPH", label: "RPH" },
                { value: "RADT", label: "RADT" },
                { value: "RRT", label: "RRT" },
                { value: "RTRP", label: "RTRP" },
                { value: "PT", label: "PT" },
                { value: "OT", label: "OT" },
                { value: "SLP", label: "SLP" },
                { value: "ND", label: "ND" },
                { value: "DMD", label: "DMD" },
                { value: "DPBS", label: "DPBS" },
                { value: "DPBO", label: "DPBO" },
                { value: "DPBU", label: "DPBU" },
                { value: "DPIM", label: "DPIM" },
                { value: "DPOGS", label: "DPOGS" },
                { value: "FPCS", label: "FPCS" },
                { value: "FPSGS", label: "FPSGS" },
                { value: "FPAO", label: "FPAO" },
                { value: "FPUA", label: "FPUA" },
                { value: "FPCR", label: "FPCR" },
                { value: "FICS", label: "FICS" },
                { value: "FPOA", label: "FPOA" },
                { value: "FPALES", label: "FPALES" },
                { value: "MBA", label: "MBA" },
                { value: "MHM", label: "MHM" },
                { value: "MMHOA", label: "MMHOA" },
                { value: "MPH", label: "MPH" },
                { value: "MET III", label: "MET III" },
                { value: "HD TECHNICIAN", label: "HD TECHNICIAN" },
              ]}
              onChange={(v) => handleChange("title", v)}
            />
          </div>
        </div>
      </section>

      {/* ── Employment Information ── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase border-b pb-2">
          Employment Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchableSelect
            label="Position Classification"
            value={formData.rolePosition}
            placeholder="Select position classification"
            multiple
            options={[
              { value: "CHIEF", label: "CHIEF" },
              { value: "DIRECTOR", label: "DIRECTOR" },
              { value: "ASSISTANT DIRECTOR", label: "ASSISTANT DIRECTOR" },
              { value: "OFFICER IN CHARGE", label: "OFFICER IN CHARGE" },
              { value: "COMMITTEE", label: "COMMITTEE" },
              { value: "CHAIRMAN", label: "CHAIRMAN" },
              { value: "HEAD", label: "HEAD" },
              { value: "SUPERVISOR", label: "SUPERVISOR" },
              { value: "STAFF", label: "STAFF" },
            ]}
            onChange={(v) => handleChange("rolePosition", v)}
          />
          <SearchableSelect
            label="Sex"
            value={formData.gender}
            placeholder="Select sex"
            options={[
              { value: "MALE", label: "MALE" },
              { value: "FEMALE", label: "FEMALE" },
            ]}
            onChange={(v) => handleChange("gender", v)}
          />
          <SearchableSelect
            label="Division"
            value={formData.division}
            placeholder="Select division"
            options={allDivisions.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
            onChange={(v) => handleChange("division", v)}
          />
          <SearchableSelect
            label="Department"
            value={formData.department}
            placeholder="Select department"
            multiple
            options={departments.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
            onChange={(v) => handleChange("department", v)}
          />
          <SearchableSelect
            label="Deployment Area"
            value={formData.designation}
            placeholder="Select deployment area"
            multiple
            options={departments.map((d) => ({
              value: d.name.toUpperCase(),
              label: d.name.toUpperCase(),
            }))}
            onChange={(v) => handleChange("designation", v)}
          />
          <InputField
            label="Annual Salary"
            type="number"
            value={formData.annualSalary}
            onChange={(v) => handleChange("annualSalary", v)}
          />
          <SearchableSelect
            label="Employee Type"
            value={formData.employeeType}
            placeholder="Select employee type"
            options={[
              { value: "Plantilla", label: "PLANTILLA" },
              { value: "Contract of Service", label: "CONTRACT OF SERVICE" },
              { value: "Consultant", label: "CONSULTANT" },
            ]}
            onChange={(v) => handleChange("employeeType", v)}
          />
          <SearchableSelect
            label="Status"
            value={formData.status}
            placeholder="Select status"
            options={[
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "INACTIVE", label: "INACTIVE" },
              { value: "RESIGN", label: "RESIGN" },
            ]}
            onChange={(v) => handleChange("status", v)}
          />
        </div>

        {/* ── Plantilla fields ── */}
        {formData.employeeType === "Plantilla" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <SearchableSelect
              label="Plantilla Position"
              value={formData.plantillaPositionId}
              displayLabel={selectedPositionLabel}
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
                          !pos.is_assignable && !pos.is_current_employee,
                      }))
                  : []
              }
              onChange={handlePositionChange}
              placeholder="Select position slot"
            />
            <div className="flex flex-col">
              <Label className="text-xs font-semibold uppercase">
                Salary Grade
              </Label>
              <Input
                value={formData.sgLevel ? `SG ${formData.sgLevel}` : "—"}
                readOnly
                className="bg-gray-50 cursor-default text-gray-600"
              />
            </div>
            <SearchableSelect
              label="Step"
              value={formData.stepIncrementId}
              placeholder={
                formData.plantillaPositionId
                  ? steps.length === 0
                    ? "No steps available"
                    : "Select step"
                  : "Select a position first"
              }
              disabled={!formData.plantillaPositionId || steps.length === 0}
              options={steps.map((s) => ({
                value: String(s.id),
                label: `Step ${s.step}`,
              }))}
              onChange={(v) => handleChange("stepIncrementId", v)}
            />
          </div>
        )}

        {/* ── Contract of Service fields ── */}
        {formData.employeeType === "Contract of Service" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <SearchableSelect
              label="COS Position"
              value={formData.cosPositionId}
              placeholder="Select COS position"
              options={
                Array.isArray(cosPositions)
                  ? cosPositions.map((p) => ({
                      value: String(p.id),
                      label: p.title.toUpperCase(),
                    }))
                  : []
              }
              onChange={(v) => handleChange("cosPositionId", v)}
            />
          </div>
        )}

        {/* ── Consultant fields ── */}
        {formData.employeeType === "Consultant" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <SearchableSelect
              label="Consultant Position"
              value={formData.consultantPositionId}
              placeholder="Select consultant position"
              options={
                Array.isArray(consultantPositions)
                  ? consultantPositions.map((p) => ({
                      value: String(p.id),
                      label: p.title.toUpperCase(),
                    }))
                  : []
              }
              onChange={(v) => handleChange("consultantPositionId", v)}
            />
          </div>
        )}
      </section>

      {/* ── Parent Assignment ── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase border-b pb-2">
          Parent Assignment
        </h3>
        <Button type="button" onClick={addParent}>
          + Add Parent
        </Button>
        {parents.map((parent, index) => {
          const selectedEmployee = parentCandidates.find(
            (emp) => String(emp.id) === parent.parentId,
          );
          return (
            <div key={index} className="flex flex-col sm:flex-row gap-2">
              <Popover
                open={openIndex === index}
                onOpenChange={(open) => setOpenIndex(open ? index : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full sm:w-[300px] justify-between font-normal uppercase",
                      !selectedEmployee && "text-gray-400",
                    )}
                  >
                    <span
                      className={cn(
                        "truncate uppercase",
                        !selectedEmployee && "text-gray-400",
                      )}
                    >
                      {selectedEmployee
                        ? selectedEmployee.full_name
                        : "Select Parent"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(300px,calc(100vw-2rem))] p-0">
                  <Command>
                    <CommandInput placeholder="Search employee..." />
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
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
                            onSelect={() => updateParent(index, String(emp.id))}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
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
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => removeParent(index)}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </section>

      <div className="w-full flex justify-center">
        <Button type="submit" className="w-md bg-black text-white">
          {employee ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <Label className="text-xs font-semibold uppercase">{label}</Label>
      <Input
        type={type}
        value={value ?? ""}
        className="uppercase"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SearchableSelect({
  label,
  value = [],
  options,
  onChange,
  placeholder,
  disabled,
  multiple = false,
  displayLabel = "",
}) {
  const [open, setOpen] = useState(false);

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : [value].filter(Boolean)
    : [value].filter(Boolean);

  const selectedLabels =
    displayLabel ||
    options
      .filter((o) => selectedValues.includes(o.value))
      .map((o) => o.label)
      .join(", ");

  const toggleValue = (val) => {
    if (!multiple) {
      onChange(val);
      setOpen(false);
      return;
    }
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="flex flex-col">
      <Label className="text-xs font-semibold uppercase">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal uppercase",
              !selectedLabels ? "text-gray-400" : "text-foreground",
            )}
          >
            <span
              className={cn(
                "truncate uppercase",
                !selectedLabels ? "text-gray-400" : "text-foreground",
              )}
            >
              {selectedLabels || (placeholder ?? "SELECT...")}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[min(var(--radix-popover-trigger-width),calc(100vw-2rem))]"
          style={{ minWidth: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandInput
              placeholder={`Search ${label}...`}
              className="uppercase"
            />
            <CommandEmpty>NO RESULT FOUND.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  className={cn(
                    "uppercase",
                    opt.disabled &&
                      "opacity-40 pointer-events-none cursor-not-allowed",
                  )}
                  disabled={opt.disabled}
                  onSelect={() => !opt.disabled && toggleValue(opt.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 flex-shrink-0",
                      selectedValues.includes(opt.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {opt.label}
                  {opt.disabled && (
                    <span className="ml-auto text-[10px] text-slate-400 font-normal normal-case">
                      Occupied
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
