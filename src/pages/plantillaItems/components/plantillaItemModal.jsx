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
import { Loader2, Plus, Pencil, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  plantillaItemService,
  plantillaPositionService,
} from "../../../services/plantillaService";
import api from "@/api/api";

/*
|─────────────────────────────────────────────────────────────────────────────
| AddItemModal
| salary_grade_id removed — SG now lives per position slot, not per item
| NEW: Dropdown to select existing plantilla items
|─────────────────────────────────────────────────────────────────────────────
*/

const itemDefaults = {
  base_item_number: "",
  title: "",
  description: "",
  approved_slots: 1,
};

function AddItemForm({ open, onOpenChange, onSuccess }) {
  const form = useForm({ defaultValues: itemDefaults });
  const [saving, setSaving] = useState(false);
  const [existingItems, setExistingItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedExistingItem, setSelectedExistingItem] = useState("");

  // Load existing plantilla items on modal open
  useEffect(() => {
    if (!open) return;
    setLoadingItems(true);
    plantillaItemService
      .getPlantillaItems()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res.data ?? []);
        setExistingItems(data);
      })
      .catch((err) => {
        console.error("Failed to load items:", err);
      })
      .finally(() => setLoadingItems(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset(itemDefaults);
      setSelectedExistingItem("");
    }
  }, [open]);

  const handleSubmit = async (data) => {
    // If an existing item is selected, add a slot to it
    if (selectedExistingItem) {
      setSaving(true);
      try {
        await api.post("/plantilla-positions", {
          plantilla_item_id: Number(selectedExistingItem),
        });
        toast.success("Slot added to existing plantilla item.");
        onOpenChange(false);
        onSuccess?.();
      } catch (err) {
        toast.error(
          err?.response?.data?.message ??
            "Something went wrong. Please try again.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    // Otherwise, create a new item
    setSaving(true);
    try {
      await plantillaItemService.createPlantillaItem({
        ...data,
        approved_slots: Number(data.approved_slots),
      });
      toast.success("Plantilla item added and slots provisioned.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
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
            {/* Dropdown to select existing item */}
            <div>
              <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                Or Select Existing Item
              </FormLabel>
              <Select
                value={selectedExistingItem}
                onValueChange={setSelectedExistingItem}
                disabled={loadingItems}
              >
                <SelectTrigger className="text-sm border-gray-200 focus:ring-gray-300 focus:ring-1">
                  <SelectValue
                    placeholder={
                      loadingItems
                        ? "Loading items..."
                        : "Choose to add slot to existing item"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {existingItems.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No existing items found. Create one below.
                    </div>
                  ) : (
                    existingItems.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        <span className="font-mono text-xs mr-2">
                          #{item.base_item_number}
                        </span>
                        {item.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {!selectedExistingItem && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400">
                      or create new item
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="base_item_number"
                  rules={{ required: "Item number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Item Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 8"
                          className="font-mono text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
                          {...field}
                        />
                      </FormControl>
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
                          className="text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1 uppercase"
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
                          className="text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1 resize-none"
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
                          className="font-mono text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Sets how many position slots will be created. Salary
                        Grade and Step are set per slot after creation.
                      </p>
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
                className="text-sm border-gray-200 text-gray-600 hover:bg-gray-50 h-9"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-sm bg-gray-900 hover:bg-black text-white h-9"
              >
                {saving && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {selectedExistingItem ? "Add Slot" : "Add Item"}
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

/*
|─────────────────────────────────────────────────────────────────────────────
| PositionModal — edit SG + step + date of assumption on a slot
| SG and steps now fetched from the position itself, not the parent item
|─────────────────────────────────────────────────────────────────────────────
*/

const positionDefaults = {
  position_title: "",
  salary_grade_id: "",
  step_increment_id: "",
  date_of_assumption: "",
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
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load salary grades once on open
  useEffect(() => {
    if (!open) return;
    setLoadingGrades(true);
    plantillaItemService
      .getSalaryGrades()
      .then((res) => setSalaryGrades(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingGrades(false));
  }, [open]);

  // Pre-fill form from position data
  useEffect(() => {
    if (open && position) {
      form.reset({
        position_title: position.position_title ?? "",
        salary_grade_id: String(position.salary_grade_id ?? ""),
        step_increment_id: String(position.step_increment_id ?? ""),
        date_of_assumption: position.date_of_assumption ?? "",
      });
    }
  }, [open, position]);

  // Load steps whenever salary_grade_id changes
  const watchedSgId = form.watch("salary_grade_id");
  useEffect(() => {
    if (!watchedSgId) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    // Clear stale step selection when SG changes
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
      });
      toast.success(`Slot ${position.item_number} updated.`);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update slot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
              <Pencil size={13} />
            </span>
            Edit Slot{" "}
            <span className="font-mono text-indigo-600">
              {position?.item_number}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4"
          >
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
                      className="text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Salary Grade — now editable per slot */}
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
                      <SelectTrigger className="text-sm border-gray-200 focus:ring-gray-300 focus:ring-1">
                        <SelectValue
                          placeholder={
                            loadingGrades ? "Loading..." : "Select salary grade"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {salaryGrades.map((sg) => (
                        <SelectItem key={sg.id} value={String(sg.id)}>
                          SG {sg.salary_grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Step — dependent on SG selection above */}
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
                      <SelectTrigger className="text-sm border-gray-200 focus:ring-gray-300 focus:ring-1">
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
                        <SelectItem key={s.id} value={String(s.id)}>
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
                      className="text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
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
                className="text-sm border-gray-200 text-gray-600 hover:bg-gray-50 h-9"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-sm bg-gray-900 hover:bg-black text-white h-9"
              >
                {saving && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/*
|─────────────────────────────────────────────────────────────────────────────
| AssignEmployeeModal — assign an employee to a VACANT position slot
| SG now read from position.salary_grade instead of item.salary_grade
|─────────────────────────────────────────────────────────────────────────────
*/

const assignDefaults = {
  employee_id: "",
  start_date: "",
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
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset(assignDefaults);
      setSearch("");
    }
  }, [open]);

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
        is_primary: true,
      });
      toast.success(`Employee assigned to slot ${position.item_number}.`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to assign employee.");
    } finally {
      setSaving(false);
    }
  };

  // SG and step now read from the position, not the parent item
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
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
              <UserPlus size={13} />
            </span>
            Assign Employee
            <span className="font-mono text-indigo-600 ml-1">
              — Slot {position?.item_number}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4"
          >
            {/* Position info (read-only) */}
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
            </div>

            {/* Employee search + select */}
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
                      className="pl-8 h-8 text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
                    />
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200 focus:ring-gray-300 focus:ring-1">
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
                            <SelectItem key={e.id} value={String(e.id)}>
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

            {/* Start date */}
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
                      className="text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
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
                className="text-sm border-gray-200 text-gray-600 hover:bg-gray-50 h-9"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-sm bg-gray-900 hover:bg-black text-white h-9"
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
