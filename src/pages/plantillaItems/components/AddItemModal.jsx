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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { plantillaPositionService as plantillaItemService } from "@/services/plantillaService";
import { itemDefaults } from "../helpers/constants";
import { fetchAllUnits, parseDisplayTarget } from "../helpers/plantillaHelpers";
import { HierarchyTargetField } from "./HierarchyTargetField";

function AddItemForm({ open, onOpenChange, onSuccess }) {
  const form = useForm({ defaultValues: itemDefaults });
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
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
