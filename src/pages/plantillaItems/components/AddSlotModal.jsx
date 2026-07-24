import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { plantillaPositionService } from "@/services/plantillaService";
import { addSlotDefaults, ROLE_OPTIONS } from "../helpers/constants";
import { fetchAllUnits, resolveInheritedConfig } from "../helpers/plantillaHelpers";
import { DeptSelectContent } from "./DeptSelectContent";

export function AddSlotModal({ open, onOpenChange, item, onSuccess }) {
  const form = useForm({ defaultValues: addSlotDefaults });

  const inherited = useMemo(
    () => resolveInheritedConfig(item?.positions ?? []),
    [item],
  );

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
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
              <Plus size={13} />
            </span>
            Add Slot
            {item?.title && (
              <span className="font-mono text-indigo-600 ml-1">
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

            {inherited ? (
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                  SG{inherited.step_label ? " · Step" : ""} — inherited from
                  existing slots
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

                {watchedSgId && (loadingSteps || steps.length > 0) && (
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
                          disabled={loadingSteps}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm border-gray-200">
                              <SelectValue
                                placeholder={
                                  loadingSteps ? "Loading..." : "Select step"
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
                )}
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
                    <p className="text-[11px] text-indigo-500">
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
                className="text-sm bg-gray-900 hover:bg-black text-white h-9"
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
