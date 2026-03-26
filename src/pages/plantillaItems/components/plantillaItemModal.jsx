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
import { Loader2, Plus, Pencil } from "lucide-react";
import { plantillaItemService } from "../../../services/plantillaService";

const defaultValues = {
  item_number: "",
  title: "",
  description: "",
  salary_grade_id: "",
  step_increment_id: "",
};

export default function PlantillaItemModal({
  open,
  onOpenChange,
  item,
  loading,
  onSubmit,
}) {
  const isEdit = !!item;
  const form = useForm({ defaultValues });

  const [salaryGrades, setSalaryGrades] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);

  const watchedSgId = form.watch("salary_grade_id");

  // Fetch salary grades on open
  useEffect(() => {
    if (!open) return;
    setLoadingGrades(true);
    plantillaItemService
      .getSalaryGrades()
      .then((res) => setSalaryGrades(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingGrades(false));
  }, [open]);

  // Fetch steps when salary grade changes
  useEffect(() => {
    if (!watchedSgId) {
      setSteps([]);
      form.setValue("step_increment_id", "");
      return;
    }
    setLoadingSteps(true);
    plantillaItemService
      .getStepsBySalaryGrade(watchedSgId)
      .then((res) => setSteps(res.data ?? res))
      .catch(console.error)
      .finally(() => setLoadingSteps(false));
  }, [watchedSgId]);

  // Reset form on open/item change
  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? {
              item_number: item.item_number ?? "",
              title: item.title ?? "",
              description: item.description ?? "",
              salary_grade_id: String(item.salary_grade_id ?? ""),
              step_increment_id: String(item.step_increment_id ?? ""),
            }
          : defaultValues,
      );
    }
  }, [open, item]);

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      salary_grade_id: Number(data.salary_grade_id),
      step_increment_id: Number(data.step_increment_id),
      ...(item?.id ? { id: item.id } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
              {isEdit ? <Pencil size={13} /> : <Plus size={13} />}
            </span>
            {isEdit ? "Update Plantilla Item" : "Add Plantilla Item"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            {/* Item Number */}
            <FormField
              control={form.control}
              name="item_number"
              rules={{ required: "Item number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Item Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 1"
                      className="font-mono text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Title */}
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
                      placeholder="e.g. CITY GOVERNMENT DEPARTMENT HEAD III"
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

            {/* Description */}
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

            {/* Salary Grade */}
            <FormField
              control={form.control}
              name="salary_grade_id"
              rules={{ required: "Salary grade is required" }}
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

            {/* Step Increment */}
            <FormField
              control={form.control}
              name="step_increment_id"
              rules={{ required: "Step is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Step Increment
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchedSgId || loadingSteps}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200 focus:ring-gray-300 focus:ring-1">
                        <SelectValue
                          placeholder={
                            !watchedSgId
                              ? "Select salary grade first"
                              : loadingSteps
                                ? "Loading..."
                                : "Select step"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Actions */}
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
                disabled={loading}
                className="text-sm bg-gray-900 hover:bg-black text-white h-9"
              >
                {loading && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {isEdit ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
