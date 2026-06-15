import { useState, useEffect, Fragment } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Plus,
  Search,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PositionModal, AssignEmployeeModal } from "./plantillaItemModal";
import DeleteConfirmModal from "./deleteConfirmationModal";
import { plantillaPositionService } from "../../../services/plantillaService";
import api from "@/api/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEADERS = [
  "",
  "#",
  "Title",
  "Approved",
  "Filled",
  "Vacant",
  "Unfilled",
  "Actions",
];

const POSITION_HEADERS = [
  "Item Number",
  "Position Title",
  "SG",
  "Step",
  "Status",
  "Assigned To",
  "Actions",
];

const STATUS_STYLES = {
  FILLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VACANT: "bg-amber-50   text-amber-600   border-amber-200",
  UNFILLED: "bg-red-50     text-red-600     border-red-200",
};

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

const PAGE_SIZE = 15;

const addSlotDefaults = {
  slots_to_add: 1,
  salary_grade_id: "",
  step_increment_id: "",
  role: "",
  display_department_id: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortItems(items) {
  return [...items].sort((a, b) => {
    const numA = Number(a.base_item_number);
    const numB = Number(b.base_item_number);
    const bothNumeric = !isNaN(numA) && !isNaN(numB);
    if (bothNumeric) return numA - numB;
    return String(a.base_item_number).localeCompare(String(b.base_item_number));
  });
}

// FIX: Pick the most representative slot config from existing positions.
// Previously only the first slot with SG+Step was used; now we pick the
// most common SG/Step pair so inherited config is more reliable.
function resolveInheritedConfig(positions = []) {
  const configured = positions.filter(
    (p) => p.salary_grade_id && p.step_increment_id,
  );
  if (configured.length === 0) return null;

  // Count occurrences of each SG+Step pair and pick the most common one.
  const freq = new Map();
  for (const p of configured) {
    const key = `${p.salary_grade_id}:${p.step_increment_id}`;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  const topKey = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const best = configured.find(
    (p) => `${p.salary_grade_id}:${p.step_increment_id}` === topKey,
  );

  return {
    sg_id: String(best.salary_grade_id),
    step_id: String(best.step_increment_id),
    sg_label: best.salary_grade?.salary_grade
      ? `SG ${best.salary_grade.salary_grade}`
      : null,
    step_label: best.step_increment?.step
      ? `Step ${best.step_increment.step}`
      : null,
    monthly_salary: best.step_increment?.monthly_salary ?? null,
  };
}

// ─── TableSkeleton ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <TableRow key={i}>
      {ITEM_HEADERS.map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const key = status?.toUpperCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold capitalize px-2 py-0.5",
        STATUS_STYLES[key] ?? "bg-slate-50 text-slate-500 border-slate-200",
      )}
    >
      {status?.toLowerCase() ?? "—"}
    </Badge>
  );
}

// ─── DeptSelectContent (Tabbed) ───────────────────────────────────────────────

function DeptSelectContent({ departments, loading, search, onSearch }) {
  const [activeTab, setActiveTab] = useState(DEPT_TYPES[0]);

  const filtered = departments.filter(
    (d) =>
      (d.type ?? "").toUpperCase() === activeTab &&
      d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SelectContent className="p-0 overflow-hidden w-72">
      {/* Tabs */}
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

      {/* Search */}
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

      {/* List */}
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
              key={dept.id}
              value={String(dept.id)}
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

// ─── AddSlotModal ─────────────────────────────────────────────────────────────

function AddSlotModal({ open, onOpenChange, item, onSuccess }) {
  const form = useForm({ defaultValues: addSlotDefaults });

  // FIX: Use resolveInheritedConfig instead of picking just the first slot.
  const inherited = resolveInheritedConfig(item?.positions ?? []);

  const [departments, setDepartments] = useState([]);
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");

  useEffect(() => {
    if (!open) return;

    setLoadingDepts(true);
    fetchAllUnits()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setLoadingDepts(false));

    if (!inherited) {
      setLoadingGrades(true);
      plantillaPositionService
        .getSalaryGrades()
        .then((res) => setSalaryGrades(res.data ?? res))
        .catch(console.error)
        .finally(() => setLoadingGrades(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset(addSlotDefaults);
      setDeptSearch("");
    }
  }, [open]);

  const watchedSgId = form.watch("salary_grade_id");
  const watchedRole = form.watch("role");
  const isStaffRole = watchedRole === "STAFF";

  useEffect(() => {
    if (inherited) return;
    if (!watchedSgId) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    form.setValue("step_increment_id", "");
    plantillaPositionService
      .getStepsBySalaryGrade(watchedSgId)
      .then((res) => setSteps(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingSteps(false));
  }, [watchedSgId]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      // FIX: Build the slotConfig to pass to addSlots.
      // If inherited config exists, use it automatically.
      // If the user manually picked SG/Step (no inherited), use those.
      const slotConfig = inherited
        ? {
            salary_grade_id: Number(inherited.sg_id),
            step_increment_id: Number(inherited.step_id),
            role: data.role || null,
            display_department_id: data.display_department_id
              ? Number(data.display_department_id)
              : null,
          }
        : {
            salary_grade_id: data.salary_grade_id
              ? Number(data.salary_grade_id)
              : null,
            step_increment_id: data.step_increment_id
              ? Number(data.step_increment_id)
              : null,
            role: data.role || null,
            display_department_id: data.display_department_id
              ? Number(data.display_department_id)
              : null,
          };

      await plantillaPositionService.addSlots(
        item.base_item_number,
        Number(data.slots_to_add),
        slotConfig,
      );

      toast.success(
        `${data.slots_to_add} slot${Number(data.slots_to_add) > 1 ? "s" : ""} added successfully.`,
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to add slot.");
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
              <Plus size={13} />
            </span>
            Add Slot
            {item?.title && (
              <span className="font-mono text-slate-500 ml-1">
                — {item.title}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto"
          >
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Current Slots
              </p>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="text-xs text-slate-500">
                  Approved:{" "}
                  <span className="font-semibold text-slate-700 font-mono">
                    {item?.approved_slots ?? 0}
                  </span>
                </span>
                <span className="text-xs text-emerald-600">
                  Filled:{" "}
                  <span className="font-semibold font-mono">
                    {item?.filled_count ?? 0}
                  </span>
                </span>
                <span className="text-xs text-amber-500">
                  Vacant:{" "}
                  <span className="font-semibold font-mono">
                    {item?.vacant_count ?? 0}
                  </span>
                </span>
                <span className="text-xs text-red-500">
                  Unfilled:{" "}
                  <span className="font-semibold font-mono">
                    {item?.unfilled_count ?? 0}
                  </span>
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="slots_to_add"
              rules={{
                required: "Number of slots is required",
                min: { value: 1, message: "Must be at least 1" },
                max: { value: 99, message: "Cannot exceed 99" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Number of Slots to Add
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* FIX: Show inherited SG/Step as read-only display.
                If no existing slot has SG+Step configured, show manual selects. */}
            {inherited ? (
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                  SG · Step — inherited from existing slots
                </p>
                <p className="text-sm font-mono font-semibold text-indigo-700">
                  {inherited.sg_label ?? "—"}
                  {inherited.step_label ? ` · ${inherited.step_label}` : ""}
                  {inherited.monthly_salary != null && (
                    <span className="ml-2 text-xs text-indigo-400 font-normal">
                      — ₱
                      {Number(inherited.monthly_salary).toLocaleString("en-PH")}
                      /mo
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-indigo-400">
                  New slots will automatically use this configuration.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}

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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue placeholder="Select role" />
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Department{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  {watchedRole && (
                    <p className="text-[11px] text-emerald-600">
                      {isStaffRole
                        ? "This position will appear in the department's staff list as Vacant."
                        : "This position will appear as a Vacant node in the org chart under this department."}
                    </p>
                  )}
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingDepts}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue
                          placeholder={
                            loadingDepts ? "Loading..." : "Select department"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <DeptSelectContent
                      departments={departments}
                      loading={loadingDepts}
                      search={deptSearch}
                      onSearch={setDeptSearch}
                    />
                  </Select>
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
                Add Slot
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── PositionsSubTable ────────────────────────────────────────────────────────

function PositionsSubTable({ item, onRefresh }) {
  const positions = item.positions ?? [];

  const [editPos, setEditPos] = useState(null);
  const [deletePos, setDeletePos] = useState(null);
  const [assignPos, setAssignPos] = useState(null);

  const handleDelete = async () => {
    try {
      await plantillaPositionService.deletePosition(deletePos.id);
      toast.success("Slot removed.");
      setDeletePos(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to remove slot.");
    }
  };

  return (
    <>
      <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-3">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {POSITION_HEADERS.map((h) => (
                  <TableHead
                    key={h}
                    className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 py-2.5 text-center whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={POSITION_HEADERS.length}
                    className="text-center py-8 text-xs text-slate-400"
                  >
                    No slots provisioned yet.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => {
                  const statusKey = (pos.status ?? "").toUpperCase();
                  const canDelete =
                    statusKey !== "FILLED" && statusKey !== "UNFILLED";
                  const canAssign = statusKey === "VACANT";

                  const activeEmployee = pos.assignments?.[0]?.employee;
                  const employeeName = activeEmployee
                    ? [
                        activeEmployee.prefix,
                        activeEmployee.first_name,
                        activeEmployee.last_name,
                        activeEmployee.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : null;

                  return (
                    <TableRow
                      key={pos.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <TableCell className="text-center">
<<<<<<< HEAD
                        {/* FIX: Display as base_item_number-slot_number (e.g. "3-1").
                            position_slot_name from the backend contains the title-based
                            name which belongs in the Position Title column, not here. */}
                        <div className="font-mono text-xs font-semibold text-indigo-600">
                          {item.base_item_number}-{pos.slot_number}
                          {/* {pos.position_slot_name} */}
=======
                        <div className="font-mono text-xs font-semibold text-emerald-600">
                          {pos.position_slot_name ?? pos.slot_number}
>>>>>>> b135c4e0455c5fb0e0130f82ab729bb44feccb18
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 text-center uppercase">
                        {/* FIX: Fall back to item.title when pos.position_title is empty,
                            so every slot shows the position title even if not overridden. */}
                        {pos.position_title ?? item.title ?? (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 text-center font-mono uppercase">
                        {pos.salary_grade?.salary_grade ? (
                          `SG ${pos.salary_grade.salary_grade}`
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 text-center uppercase">
                        {pos.step_increment?.step ? (
                          `Step ${pos.step_increment.step}`
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <StatusBadge status={pos.status} />
                      </TableCell>

                      <TableCell className="text-center">
                        {employeeName ? (
                          <span className="text-xs text-slate-700 font-medium">
                            {employeeName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30"
                            disabled={!canAssign}
                            onClick={() => setAssignPos(pos)}
                            title={
                              canAssign
                                ? "Assign employee"
                                : "Only vacant slots can be assigned"
                            }
                          >
                            <UserPlus size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => setEditPos(pos)}
                            title="Edit slot"
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                            disabled={!canDelete}
                            onClick={() => setDeletePos(pos)}
                            title={
                              canDelete
                                ? "Remove slot"
                                : "Cannot remove a filled or unfilled slot"
                            }
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PositionModal
        open={!!editPos}
        onOpenChange={(v) => {
          if (!v) setEditPos(null);
        }}
        item={item}
        position={editPos}
        onSuccess={() => {
          setEditPos(null);
          onRefresh();
        }}
      />
      <AssignEmployeeModal
        open={!!assignPos}
        onOpenChange={(v) => {
          if (!v) setAssignPos(null);
        }}
        item={item}
        position={assignPos}
        onSuccess={() => {
          setAssignPos(null);
          onRefresh();
        }}
      />
      <DeleteConfirmModal
        open={!!deletePos}
        onOpenChange={(v) => {
          if (!v) setDeletePos(null);
        }}
        item={deletePos}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ─── PlantillaItemTable (default export) ──────────────────────────────────────

export default function PlantillaItemTable({
  items,
  loading,
  search,
  onRefresh,
}) {
  const [expanded, setExpanded] = useState(new Set());
  const [page, setPage] = useState(1);
  const [addSlotItem, setAddSlotItem] = useState(null);

  const sorted = sortItems(items);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {ITEM_HEADERS.map((h, i) => (
                <TableHead
                  key={i}
                  className="text-xs font-semibold uppercase tracking-widest text-slate-400 py-3.5 whitespace-nowrap text-center"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={ITEM_HEADERS.length}
                  className="text-center py-16"
                >
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <ClipboardList size={36} className="opacity-30" />
                    <p className="text-sm font-medium">
                      {search
                        ? "No items match your search"
                        : "No plantilla items yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item) => {
                const isOpen = expanded.has(item.id);
                const filledCnt = item.filled_count ?? 0;
                const vacantCnt = item.vacant_count ?? 0;
                const unfilledCnt = item.unfilled_count ?? 0;

                return (
                  <Fragment key={item.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer hover:bg-slate-50/80 transition-colors",
                        isOpen && "bg-slate-50",
                      )}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <TableCell className="w-10 text-center">
                        {isOpen ? (
                          <ChevronDown
                            size={14}
                            className="text-slate-400 mx-auto"
                          />
                        ) : (
                          <ChevronRight
                            size={14}
                            className="text-slate-400 mx-auto"
                          />
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-300 font-mono text-center w-10">
                        {item.base_item_number}
                      </TableCell>

                      <TableCell className="text-left">
                        <div className="font-medium text-slate-800 text-sm uppercase">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono text-sm font-semibold text-slate-700">
                        {item.approved_slots}
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            filledCnt > 0
                              ? "text-emerald-600"
                              : "text-slate-300",
                          )}
                        >
                          {filledCnt}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            vacantCnt > 0 ? "text-amber-500" : "text-slate-300",
                          )}
                        >
                          {vacantCnt}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            unfilledCnt > 0 ? "text-red-500" : "text-slate-300",
                          )}
                        >
                          {unfilledCnt}
                        </span>
                      </TableCell>

                      <TableCell
                        className="w-20 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Add slot"
                          onClick={() => setAddSlotItem(item)}
                        >
                          <Plus size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={ITEM_HEADERS.length}
                          className="p-0"
                        >
                          <PositionsSubTable
                            item={item}
                            onRefresh={onRefresh}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, sorted.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">{sorted.length}</span>{" "}
            items
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronDown size={14} className="rotate-90" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={`page-${p}`}
                    size="icon"
                    variant={safePage === p ? "default" : "outline"}
                    onClick={() => setPage(p)}
                    className="h-8 w-8 text-xs"
                  >
                    {p}
                  </Button>
                ),
              )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              <ChevronDown size={14} className="-rotate-90" />
            </Button>
          </div>
        </div>
      )}

      <AddSlotModal
        open={!!addSlotItem}
        onOpenChange={(v) => {
          if (!v) setAddSlotItem(null);
        }}
        item={addSlotItem}
        onSuccess={() => {
          setAddSlotItem(null);
          onRefresh();
        }}
      />
    </div>
  );
}
