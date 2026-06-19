//src/pages/plantillaitems/plantillaitemModal.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, UserPlus, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  plantillaPositionService as plantillaItemService,
  plantillaPositionService,
} from "../../../services/plantillaService";
import api from "@/api/api";

const ROLE_OPTIONS = [
  "CHIEF",
  "DIRECTOR",
  "ASSISTANT DIRECTOR",
  "OFFICER IN CHARGE",
  "CHAIRMAN",
  "HEAD",
  "SUPERVISOR",
  "STAFF",
];

const DEPT_TYPES = ["OFFICE", "DIRECTORATE", "DIVISION", "DEPARTMENT"];

const TYPE_BADGE = {
  OFFICE: "bg-indigo-100 text-indigo-700",
  DIRECTORATE: "bg-purple-100 text-purple-700",
  DIVISION: "bg-teal-100 text-teal-700",
  DEPARTMENT: "bg-blue-100 text-blue-700",
};

function unitValue(unit) {
  const prefix =
    (unit?.type ?? "").toUpperCase() === "DEPARTMENT"
      ? "department"
      : "division";
  return `${prefix}:${unit.id}`;
}

function parseDisplayTarget(value) {
  const [type, id] = (value || "").split(":");
  return {
    display_department_id: type === "department" && id ? Number(id) : null,
    display_division_id: type === "division" && id ? Number(id) : null,
  };
}

function buildDisplayTarget({ display_department_id, display_division_id }) {
  if (display_department_id) return `department:${display_department_id}`;
  if (display_division_id) return `division:${display_division_id}`;
  return "";
}

async function fetchAllUnits() {
  const [divRes, deptRes] = await Promise.all([
    api.get("/divisions"),
    api.get("/departments"),
  ]);
  const divData = divRes.data;
  const deptData = deptRes.data;
  const divisions = Array.isArray(divData) ? divData : (divData.data ?? []);
  const departments = (
    Array.isArray(deptData) ? deptData : (deptData.data ?? [])
  ).map((d) => ({
    ...d,
    type: "DEPARTMENT",
  }));
  return [...divisions, ...departments];
}

function DeptSelectContent({ departments, loading, search, onSearch }) {
  const [activeTab, setActiveTab] = useState(DEPT_TYPES[0]);

  const filtered = departments.filter(
    (d) =>
      (d.type ?? "").toUpperCase() === activeTab &&
      d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SelectContent className="p-0 overflow-hidden w-72">
      <div className="flex border-b border-gray-100 bg-gray-50">
        {DEPT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setActiveTab(type);
            }}
            className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === type
                ? "bg-white text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {type === "DIRECTORATE"
              ? "DIR."
              : type === "DEPARTMENT"
                ? "DEPT"
                : type}
          </button>
        ))}
      </div>

      <div className="px-2 py-1.5 bg-white border-b border-gray-100">
        <div className="relative">
          <Search
            size={11}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            placeholder={`Search ${activeTab.toLowerCase()}…`}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-44">
        {loading ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center">
            No {activeTab.toLowerCase()}s found.
          </div>
        ) : (
          filtered.map((dept) => (
            <SelectItem
              key={`${dept.type}-${dept.id}`}
              value={unitValue(dept)}
              className="pl-3 [&>span:first-child]:hidden"
            >
              {dept.name}
            </SelectItem>
          ))
        )}
      </div>
    </SelectContent>
  );
}

function DeptTargetField({
  departments,
  loading,
  search,
  onSearch,
  value,
  onChange,
  placeholder = "Select department or division",
}) {
  const selectedUnit = departments.find((d) => unitValue(d) === value);

  if (value && selectedUnit) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
            TYPE_BADGE[(selectedUnit.type ?? "").toUpperCase()] ??
            "bg-gray-100 text-gray-600"
          }`}
        >
          {(selectedUnit.type ?? "").toUpperCase()}
        </span>
        <span className="text-sm font-medium flex-1 truncate">
          {selectedUnit.name}
        </span>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  if (value && !selectedUnit) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
        <span className="text-sm text-gray-400 flex-1 truncate">
          {loading ? "Loading..." : "Selected unit"}
        </span>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <Select onValueChange={onChange} value={value} disabled={loading}>
      <FormControl>
        <SelectTrigger className="text-sm border-gray-200">
          <SelectValue placeholder={loading ? "Loading..." : placeholder} />
        </SelectTrigger>
      </FormControl>
      <DeptSelectContent
        departments={departments}
        loading={loading}
        search={search}
        onSearch={onSearch}
      />
    </Select>
  );
}

// ── RoleField — chip-style selector with unselect (X) for the Role dropdown. ──────────────────────────────────────────────────────────────

function RoleField({ value, onChange, placeholder = "Select role" }) {
  if (value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
        <span className="text-sm font-medium flex-1 truncate">{value}</span>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <Select onValueChange={onChange} value={value}>
      <FormControl>
        <SelectTrigger className="text-sm border-gray-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {ROLE_OPTIONS.map((r) => (
          <SelectItem
            key={r}
            value={r}
            className="pl-3 [&>span:first-child]:hidden"
          >
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── AddItemModal ──────────────────────────────────────────────────────────────

const itemDefaults = {
  base_item_number: "",
  title: "",
  description: "",
  approved_slots: 1,
  salary_grade_id: "",
  step_increment_id: "",
  display_target: "",
};

function AddItemForm({ open, onOpenChange, onSuccess }) {
  const form = useForm({ defaultValues: itemDefaults });
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadingDepts(true);
        setLoadingGrades(true);

        const [units, items, gradesRes] = await Promise.all([
          fetchAllUnits(),
          plantillaItemService.getPlantillaItems(),
          plantillaItemService.getSalaryGrades(),
        ]);

        setDepartments(units);
        setSalaryGrades(gradesRes.data ?? gradesRes);

        if (items.length > 0) {
          const nextNumber =
            Math.max(
              ...items.map((item) => Number(item.base_item_number) || 0),
            ) + 1;
          form.setValue("base_item_number", String(nextNumber));
        } else {
          form.setValue("base_item_number", "1");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDepts(false);
        setLoadingGrades(false);
      }
    };

    loadData();
  }, [open, form]);

  useEffect(() => {
    if (!open) return;
    form.reset({ ...itemDefaults, approved_slots: 1 });
    setDeptSearch("");
    setSteps([]);
  }, [open, form]);

  const watchedSgId = form.watch("salary_grade_id");

  useEffect(() => {
    if (!watchedSgId) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    form.setValue("step_increment_id", "");
    plantillaItemService
      .getStepsBySalaryGrade(watchedSgId)
      .then((res) => setSteps(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingSteps(false));
  }, [watchedSgId]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await plantillaItemService.createPlantillaItem({
        base_item_number: data.base_item_number,
        title: data.title,
        description: data.description,
        slots: Number(data.approved_slots),
        salary_grade_id: data.salary_grade_id
          ? Number(data.salary_grade_id)
          : null,
        step_increment_id: data.step_increment_id
          ? Number(data.step_increment_id)
          : null,
        ...parseDisplayTarget(data.display_target),
      });
      toast.success("Plantilla item added and slots provisioned.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600">
              <Plus size={13} />
            </span>
            Add Plantilla Item
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="base_item_number"
              rules={{ required: "Item number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Item Number
                  </FormLabel>
                  <Input
                    readOnly
                    className="font-mono text-sm border-gray-200 bg-slate-50"
                    {...field}
                  />
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Position Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. NURSE I"
                      className="text-sm border-gray-200"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Description{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description..."
                      className="text-sm border-gray-200 resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="approved_slots"
              rules={{
                required: "Approved slots is required",
                min: { value: 1, message: "Must be at least 1" },
                max: { value: 99, message: "Cannot exceed 99" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Approved Slots
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      placeholder="1"
                      className="font-mono text-sm border-gray-200"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Role and per-slot overrides can be set after creation.
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary_grade_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Salary Grade{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingGrades}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue
                          placeholder={
                            loadingGrades ? "Loading..." : "Select salary grade"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {salaryGrades.map((sg) => (
                        <SelectItem
                          key={sg.id}
                          value={String(sg.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          SG {sg.salary_grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="step_increment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Step Increment{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingSteps || !watchedSgId}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue
                          placeholder={
                            !watchedSgId
                              ? "Select SG first"
                              : loadingSteps
                                ? "Loading..."
                                : "Select step"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {steps.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={String(s.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          Step {s.step}
                          {s.monthly_salary != null && (
                            <span className="ml-2 text-slate-400 text-xs">
                              — ₱
                              {Number(s.monthly_salary).toLocaleString("en-PH")}
                              /mo
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Department / Division{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <DeptTargetField
                    departments={departments}
                    loading={loadingDepts}
                    search={deptSearch}
                    onSearch={setDeptSearch}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select department"
                  />
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="text-sm border-gray-200 text-gray-600 h-9"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white h-9"
              >
                {saving && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Add Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function AddItemModal(props) {
  return <AddItemForm {...props} />;
}

export default function PlantillaItemModal(props) {
  return <AddItemForm {...props} />;
}

// ── PositionModal — Edit Slot ────────────────────────────────────────────────────

const positionDefaults = {
  position_title: "",
  salary_grade_id: "",
  step_increment_id: "",
  date_of_assumption: "",
  role: "",
  display_target: "",
};

export function PositionModal({
  open,
  onOpenChange,
  item,
  position,
  onSuccess,
}) {
  const form = useForm({ defaultValues: positionDefaults });

  const [salaryGrades, setSalaryGrades] = useState([]);
  const [steps, setSteps] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");

  const isFilled = (position?.status ?? "").toUpperCase() === "FILLED";

  useEffect(() => {
    if (!open) return;

    setLoadingGrades(true);
    plantillaItemService
      .getSalaryGrades()
      .then((res) => setSalaryGrades(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingGrades(false));

    setLoadingDepts(true);
    fetchAllUnits()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setLoadingDepts(false));
  }, [open]);

  useEffect(() => {
    if (open && position) {
      setDeptSearch("");
      form.reset({
        position_title: position.position_title ?? "",
        salary_grade_id: String(position.salary_grade_id ?? ""),
        step_increment_id: String(position.step_increment_id ?? ""),
        date_of_assumption: position.date_of_assumption ?? "",
        role: position.role ?? "",
        display_target: buildDisplayTarget(position),
      });
    }
  }, [open, position]);

  const watchedSgId = form.watch("salary_grade_id");
  const watchedRole = form.watch("role");
  const isStaffRole = watchedRole === "STAFF";

  useEffect(() => {
    if (!watchedSgId) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    form.setValue("step_increment_id", "");
    plantillaItemService
      .getStepsBySalaryGrade(watchedSgId)
      .then((res) => setSteps(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingSteps(false));
  }, [watchedSgId]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await plantillaPositionService.updatePosition(position.id, {
        position_title: data.position_title || null,
        salary_grade_id: data.salary_grade_id
          ? Number(data.salary_grade_id)
          : null,
        step_increment_id: data.step_increment_id
          ? Number(data.step_increment_id)
          : null,
        date_of_assumption: data.date_of_assumption || null,
        role: data.role || null,
        ...parseDisplayTarget(data.display_target),
      });
      toast.success(`Slot ${position.slot_number} updated.`);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update slot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600">
              <Pencil size={13} />
            </span>
            Edit Slot{" "}
            <span className="font-mono text-slate-500">
              {position?.position_slot_name ?? position?.slot_number}
            </span>
            {isFilled && (
              <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                FILLED — config locked
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto"
          >
            {isFilled ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-4 space-y-2">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
                  Slot is currently filled
                </p>
                <p className="text-sm text-emerald-800">
                  Configuration is locked while an employee occupies this slot.
                  To edit, vacate the position first.
                </p>
                {position?.salary_grade?.salary_grade && (
                  <p className="text-xs text-emerald-700 font-mono">
                    SG {position.salary_grade.salary_grade}
                    {position?.step_increment?.step &&
                      ` · Step ${position.step_increment.step}`}
                  </p>
                )}
                {position?.role && (
                  <p className="text-xs text-emerald-700 font-semibold uppercase">
                    Role: {position.role}
                  </p>
                )}
                {position?.display_department?.name && (
                  <p className="text-xs text-emerald-700">
                    Department: {position.display_department.name}
                  </p>
                )}
                {position?.display_division?.name && (
                  <p className="text-xs text-emerald-700">
                    Division: {position.display_division.name}
                  </p>
                )}
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="position_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Position Title{" "}
                        <span className="text-gray-300 normal-case font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. NURSE I"
                          className="text-sm border-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary_grade_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Salary Grade
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingGrades}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm border-gray-200">
                            <SelectValue
                              placeholder={
                                loadingGrades
                                  ? "Loading..."
                                  : "Select salary grade"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {salaryGrades.map((sg) => (
                            <SelectItem
                              key={sg.id}
                              value={String(sg.id)}
                              className="pl-3 [&>span:first-child]:hidden"
                            >
                              SG {sg.salary_grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="step_increment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Step Increment
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingSteps || !watchedSgId}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm border-gray-200">
                            <SelectValue
                              placeholder={
                                !watchedSgId
                                  ? "Select SG first"
                                  : loadingSteps
                                    ? "Loading..."
                                    : "Select step"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {steps.map((s) => (
                            <SelectItem
                              key={s.id}
                              value={String(s.id)}
                              className="pl-3 [&>span:first-child]:hidden"
                            >
                              Step {s.step}
                              {s.monthly_salary != null && (
                                <span className="ml-2 text-slate-400 text-xs">
                                  — ₱
                                  {Number(s.monthly_salary).toLocaleString(
                                    "en-PH",
                                  )}
                                  /mo
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_assumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Date of Assumption{" "}
                        <span className="text-gray-300 normal-case font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="text-sm border-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Role{" "}
                        <span className="text-gray-300 normal-case font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <RoleField
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Department / Division{" "}
                        <span className="text-gray-300 normal-case font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      {watchedRole && (
                        <p className="text-[11px] text-emerald-600">
                          {isStaffRole
                            ? "This position will appear in the selected department/division's staff list as Vacant."
                            : "This position will appear as a Vacant node in the org chart under the selected department/division."}
                        </p>
                      )}
                      <DeptTargetField
                        departments={departments}
                        loading={loadingDepts}
                        search={deptSearch}
                        onSearch={setDeptSearch}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="text-sm border-gray-200 text-gray-600 h-9"
                onClick={() => onOpenChange(false)}
              >
                {isFilled ? "Close" : "Cancel"}
              </Button>
              {!isFilled && (
                <Button
                  type="submit"
                  disabled={saving}
                  className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                >
                  {saving && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── AssignEmployeeModal ────────────────────────────────────────────────────

const assignDefaults = {
  employee_id: "",
  start_date: "",
  salary_grade_id: "",
  step_increment_id: "",
};

export function AssignEmployeeModal({
  open,
  onOpenChange,
  item,
  position,
  onSuccess,
}) {
  const form = useForm({ defaultValues: assignDefaults });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [salaryGrades, setSalaryGrades] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoadingEmployees(true);
    api
      .get("/employees")
      .then((res) => {
        const data = res.data;
        setEmployees(Array.isArray(data) ? data : (data.data ?? []));
      })
      .catch(console.error)
      .finally(() => setLoadingEmployees(false));

    setLoadingGrades(true);
    plantillaItemService
      .getSalaryGrades()
      .then((res) => setSalaryGrades(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingGrades(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset(assignDefaults);
      setSearch("");
      setSteps([]);
    }
  }, [open]);

  const watchedSgId = form.watch("salary_grade_id");

  useEffect(() => {
    if (!watchedSgId) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    form.setValue("step_increment_id", "");
    plantillaItemService
      .getStepsBySalaryGrade(watchedSgId)
      .then((res) => setSteps(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingSteps(false));
  }, [watchedSgId]);

  const filteredEmployees = employees.filter((e) => {
    const fullName = [e.prefix, e.first_name, e.last_name, e.suffix]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const handleSubmit = async (data) => {
    if (!data.employee_id) {
      toast.error("Please select an employee.");
      return;
    }
    if (!data.start_date) {
      toast.error("Please enter a start date.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/assignments", {
        employee_id: Number(data.employee_id),
        plantilla_position_id: position.id,
        start_date: data.start_date,
        salary_grade_id: data.salary_grade_id
          ? Number(data.salary_grade_id)
          : null,
        step_increment_id: data.step_increment_id
          ? Number(data.step_increment_id)
          : null,
        is_primary: true,
      });
      toast.success(
        `Employee assigned to slot ${position.position_slot_name ?? position.slot_number}.`,
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to assign employee.");
    } finally {
      setSaving(false);
    }
  };

  const sgLabel = position?.salary_grade?.salary_grade
    ? `SG ${position.salary_grade.salary_grade}`
    : "—";
  const stepLabel = position?.step_increment?.step
    ? `Step ${position.step_increment.step}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600">
              <UserPlus size={13} />
            </span>
            Assign Employee
            <span className="font-mono text-slate-500 ml-1">
              —{" "}
              {position?.position_slot_name ?? `Slot ${position?.slot_number}`}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto"
          >
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Position
              </p>
              <p className="text-sm font-medium text-slate-700">
                {item?.title ?? "—"}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {sgLabel}
                {stepLabel ? ` · ${stepLabel}` : ""}
              </p>
              {position?.role && (
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  {position.role}
                </p>
              )}
              {position?.display_department?.name && (
                <p className="text-xs text-emerald-600">
                  {position.display_department.name}
                </p>
              )}
              {position?.display_division?.name && (
                <p className="text-xs text-indigo-500">
                  {position.display_division.name}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="employee_id"
              rules={{ required: "Please select an employee" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Employee
                  </FormLabel>
                  <div className="relative mb-1">
                    <Search
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name…"
                      className="pl-8 h-8 text-sm border-gray-200"
                    />
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue
                          placeholder={
                            loadingEmployees ? "Loading..." : "Select employee"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {filteredEmployees.length === 0 ? (
                        <div className="px-3 py-4 text-xs text-slate-400 text-center">
                          No employees found.
                        </div>
                      ) : (
                        filteredEmployees.map((e) => {
                          const name = [
                            e.prefix,
                            e.first_name,
                            e.last_name,
                            e.suffix,
                          ]
                            .filter(Boolean)
                            .join(" ");
                          return (
                            <SelectItem
                              key={e.id}
                              value={String(e.id)}
                              className="pl-3 [&>span:first-child]:hidden"
                            >
                              {name}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary_grade_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Salary Grade{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingGrades}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue
                          placeholder={
                            loadingGrades ? "Loading..." : "Select salary grade"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {salaryGrades.map((sg) => (
                        <SelectItem
                          key={sg.id}
                          value={String(sg.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          SG {sg.salary_grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="step_increment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Step Increment{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingSteps || !watchedSgId}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue
                          placeholder={
                            !watchedSgId
                              ? "Select SG first"
                              : loadingSteps
                                ? "Loading..."
                                : "Select step"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {steps.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={String(s.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          Step {s.step}
                          {s.monthly_salary != null && (
                            <span className="ml-2 text-slate-400 text-xs">
                              — ₱
                              {Number(s.monthly_salary).toLocaleString("en-PH")}
                              /mo
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="text-sm border-gray-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="text-sm border-gray-200 text-gray-600 h-9"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white h-9"
              >
                {saving && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Assign Employee
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
