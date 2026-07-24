import { useEffect, useRef, useState } from "react";
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
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  plantillaPositionService,
  plantillaPositionService as plantillaItemService,
} from "@/services/plantillaService";
import { positionDefaults } from "../helpers/constants";
import {
  fetchAllUnits,
  parseDisplayTarget,
  buildDisplayTarget,
} from "../helpers/plantillaHelpers";
import { HierarchyTargetField } from "./HierarchyTargetField";
import { RoleField } from "./RoleField";

export function PositionModal({ open, onOpenChange, item, position, onSuccess }) {
  const form = useForm({ defaultValues: positionDefaults });

  const [salaryGrades, setSalaryGrades] = useState([]);
  const [steps, setSteps] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialSgRef = useRef(null);

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
      const initialSg = String(position.salary_grade_id ?? "");
      initialSgRef.current = initialSg;

      form.reset({
        position_title: position.position_title ?? "",
        salary_grade_id: initialSg,
        step_increment_id: String(position.step_increment_id ?? ""),
        date_of_assumption: position.date_of_assumption ?? "",
        role: position.role ?? "",
        display_target: buildDisplayTarget(position),
      });

      if (initialSg) {
        setLoadingSteps(true);
        plantillaItemService
          .getStepsBySalaryGrade(initialSg)
          .then((res) => setSteps(res.data ?? res))
          .catch(console.error)
          .finally(() => setLoadingSteps(false));
      } else {
        setSteps([]);
      }
    }
  }, [open, position]);

  const watchedSgId = form.watch("salary_grade_id");
  const watchedRole = form.watch("role");
  const isStaffRole = watchedRole === "STAFF";

  useEffect(() => {
    if (watchedSgId === initialSgRef.current) return;
    initialSgRef.current = watchedSgId;

    if (!watchedSgId) {
      setSteps([]);
      form.setValue("step_increment_id", "");
      return;
    }

    form.setValue("step_increment_id", "");
    setLoadingSteps(true);
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
                      <RoleField value={field.value} onChange={field.onChange} />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_target"
                  render={({ field }) => (
                    <FormItem>
                      {watchedRole && (
                        <p className="text-[11px] text-emerald-600 mb-1.5">
                          {isStaffRole
                            ? "This position will appear in the selected department/division's staff list as Vacant."
                            : "This position will appear as a Vacant node in the org chart under the selected department/division."}
                        </p>
                      )}
                      <HierarchyTargetField
                        units={departments}
                        loading={loadingDepts}
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
