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
    plantillaItemId: "",
    stepIncrementId: "",
    sgLevel: "",
    annualSalary: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [parents, setParents] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [allDivisions, setAllDivisions] = useState([]);
  const [plantillaItems, setPlantillaItems] = useState([]);
  const [steps, setSteps] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const selectedDepartment = departments.find(
    (d) =>
      Array.isArray(formData.department) &&
      formData.department.includes(String(d.id)),
  );

  useEffect(() => {
    const fetchAndInit = async () => {
      try {
        const [dept, plantilla] = await Promise.all([
          employeeService.getDepartments(),
          employeeService.getPlantillaItems(employee?.id),
        ]);

        const deptList = dept.data ?? dept;
        const validDeptIds = deptList.map((d) => String(d.id));
        setDepartments(deptList);
        setPlantillaItems(plantilla.data ?? plantilla);

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
        const plantillaItem =
          assignment?.plantilla_item ?? assignment?.plantillaItem ?? null;
        const step =
          assignment?.step_increment ?? assignment?.stepIncrement ?? null;

        const sgValue =
          plantillaItem?.salary_grade?.salary_grade ??
          plantillaItem?.salaryGrade?.salary_grade ??
          "";
        const annualSalaryValue =
          step?.annual_salary ??
          plantillaItem?.salary_grade?.annual_salary ??
          plantillaItem?.salaryGrade?.annual_salary ??
          "";

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
          employeeType: employee.employment_type ?? "Plantilla",
          status: employee.employment_status
            ? String(employee.employment_status).toUpperCase()
            : "",
          plantillaItemId: plantillaItem?.id ? String(plantillaItem.id) : "",
          stepIncrementId: step?.id ? String(step.id) : "",
          sgLevel: sgValue ? String(sgValue) : "",
          annualSalary: annualSalaryValue ?? "",
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
    const fetchDivisions = async () => {
      try {
        const res = await employeeService.getDivisions();
        setAllDivisions(res.data ?? res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await employeeService.getAllEmployees();
      setAllEmployees(res.data);
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!formData.plantillaItemId) {
      setSteps([]);
      return;
    }
    const item = plantillaItems.find(
      (p) => String(p.id) === String(formData.plantillaItemId),
    );
    if (!item) {
      setSteps([]);
      return;
    }
    if (item.step_increment) {
      setSteps([item.step_increment]);
    } else {
      employeeService
        .getStepsByPlantilla(formData.plantillaItemId)
        .then((res) => setSteps(res.data ?? []));
    }
  }, [formData.plantillaItemId, plantillaItems]);

  useEffect(() => {
    if (!formData.stepIncrementId) return;
    const step = steps.find(
      (s) => String(s.id) === String(formData.stepIncrementId),
    );
    if (!step) return;
    setFormData((prev) => ({
      ...prev,
      annualSalary: step.annual_salary ?? "",
    }));
  }, [formData.stepIncrementId, steps]);

  useEffect(() => {
    if (formData.employeeType !== "Plantilla") {
      setFormData((prev) => ({
        ...prev,
        plantillaItemId: "",
        stepIncrementId: "",
        sgLevel: "",
        annualSalary: "",
      }));
    }
  }, [formData.employeeType]);

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

  const handlePlantillaChange = (id) => {
    const item = plantillaItems.find((p) => String(p.id) === String(id));
    const sg =
      item?.salary_grade?.salary_grade ?? item?.salaryGrade?.salary_grade ?? "";
    const stepObj = item?.step_increment ?? item?.stepIncrement ?? null;
    const stepId = stepObj?.id ? String(stepObj.id) : "";
    const annualSalary = stepObj?.annual_salary ?? "";
    setFormData((prev) => ({
      ...prev,
      plantillaItemId: id,
      sgLevel: sg ? String(sg) : "",
      stepIncrementId: stepId,
      annualSalary,
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
    form.append("plantilla_item_id", formData.plantillaItemId);
    form.append("step_increment_id", formData.stepIncrementId);
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
        await employeeService.addEmployee(form);
        toast.success("Employee added");
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Save failed");
    }
  };

  const parentCandidates = allEmployees.filter(
    (emp) => emp.id !== employee?.id,
  );

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
        {/* 1 col on mobile → 2 on sm → 3 on md → 4 on lg */}
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
          {/* Title spans full width on mobile, normal on larger */}
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
            placeholder="SELECT STATUS"
            options={[
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "INACTIVE", label: "INACTIVE" },
              { value: "RESIGN", label: "RESIGN" },
            ]}
            onChange={(v) => handleChange("status", v)}
          />
        </div>

        {formData.employeeType === "Plantilla" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <SearchableSelect
              label="Plantilla Position"
              value={formData.plantillaItemId}
              options={plantillaItems
                .filter(
                  (item) =>
                    item.status?.toUpperCase() !== "FILLED" ||
                    item.is_current_employee,
                )
                .map((item) => ({
                  value: String(item.id),
                  label: `${item.item_number} - ${item.title}`,
                }))}
              onChange={handlePlantillaChange}
              placeholder="Select position"
            />
            <SearchableSelect
              label="Salary Grade"
              value={formData.sgLevel}
              placeholder={
                !formData.plantillaItemId
                  ? "Select plantilla first"
                  : "Salary grade"
              }
              disabled={!formData.plantillaItemId}
              options={Array.from({ length: 33 }, (_, i) => ({
                value: String(i + 1),
                label: `SG ${i + 1}`,
              }))}
              onChange={(v) => handleChange("sgLevel", v)}
            />
            <SearchableSelect
              label="Step"
              value={formData.stepIncrementId}
              disabled={!formData.plantillaItemId}
              options={steps.map((s) => ({
                value: String(s.id),
                label: `Step ${s.step}`,
              }))}
              onChange={(v) => handleChange("stepIncrementId", v)}
              placeholder={
                !formData.plantillaItemId
                  ? "Select plantilla first"
                  : steps.length === 0
                    ? "Loading steps..."
                    : "Select step"
              }
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
}) {
  const [open, setOpen] = useState(false);

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : [value].filter(Boolean)
    : [value].filter(Boolean);

  const selectedLabels = options
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
