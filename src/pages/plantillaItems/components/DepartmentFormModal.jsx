import { useEffect } from "react";
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
import { Network, Plus, Pencil, Lock } from "lucide-react";
import { toast } from "sonner";
import { DIVISION_TYPES, OFFICE_TYPES } from "../helpers/constants";
import { saveDivision, saveDepartment } from "../helpers/departmentStore";

const LABEL = "text-xs font-semibold uppercase tracking-widest text-gray-400";
const titleCase = (t) => t.charAt(0) + t.slice(1).toLowerCase();

/**
 * Add / edit a Department Database entry.
 *   tier "division"   → Directorate / Division
 *   tier "department" → Department / Section / Unit (needs a parent division)
 */
export function DepartmentFormModal({
  open,
  onOpenChange,
  tier,
  unit, // present when editing
  defaultDivisionId,
  divisions, // all divisions (for the parent dropdown)
}) {
  const isEdit = !!unit;
  const isDept = tier === "department";
  const types = isDept ? OFFICE_TYPES : DIVISION_TYPES;

  const form = useForm({
    defaultValues: { name: "", type: "", status: "ACTIVE", division_id: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: unit?.name ?? "",
      type: unit?.type ?? "",
      status: unit?.status ?? "ACTIVE",
      division_id: String(unit?.division_id ?? defaultDivisionId ?? ""),
    });
  }, [open, unit, defaultDivisionId, form]);

  // Parent can't be moved once plantilla records point at this unit.
  const parentLocked = isEdit && isDept && unit.linked_count > 0;
  const parentOptions = divisions.filter(
    (d) => d.status === "ACTIVE" || d.id === Number(unit?.division_id),
  );

  const onSubmit = (data) => {
    const res = isDept
      ? saveDepartment({ id: unit?.id, ...data, division_id: Number(data.division_id) })
      : saveDivision({ id: unit?.id, ...data });

    if (!res.ok) {
      form.setError("name", { message: res.error });
      return;
    }
    toast.success(
      `${isDept ? "Unit" : "Directorate / Division"} ${isEdit ? "updated" : "added"}.`,
    );
    onOpenChange(false);
  };

  const heading = `${isEdit ? "Edit" : "Add"} ${
    isDept ? "Department / Section / Unit" : "Directorate / Division"
  }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600">
              {isEdit ? <Pencil size={13} /> : <Plus size={13} />}
            </span>
            {heading}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            {isDept && (
              <FormField
                control={form.control}
                name="division_id"
                rules={{ required: "Choose the Directorate / Division this unit belongs to" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL}>Directorate / Division</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={parentLocked}
                    >
                      <FormControl>
                        <SelectTrigger className="text-sm border-gray-200">
                          <SelectValue placeholder="Select directorate or division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentOptions.map((d) => (
                          <SelectItem
                            key={d.id}
                            value={String(d.id)}
                            className="pl-3 [&>span:first-child]:hidden"
                          >
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {parentLocked && (
                      <p className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Lock size={10} /> Locked — {unit.linked_count} plantilla
                        slot{unit.linked_count !== 1 ? "s" : ""} are linked to this unit.
                      </p>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              rules={{
                validate: (v) => v.trim().length > 0 || "Name is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Official Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isDept
                          ? "e.g. Department of Internal Medicine"
                          : "e.g. Nursing Service"
                      }
                      className="text-sm border-gray-200"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[11px] text-gray-400">
                    Use the exact name as written in the Personnel Schedule.
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm border-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem
                          key={t}
                          value={t}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          {titleCase(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL}>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE" className="pl-3 [&>span:first-child]:hidden">
                          Active
                        </SelectItem>
                        <SelectItem value="INACTIVE" className="pl-3 [&>span:first-child]:hidden">
                          Inactive / Obsolete
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-gray-400">
                      Inactive entries disappear from the Add Item / Add Slot
                      dropdowns but stay on existing records.
                    </p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

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
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white h-9"
              >
                <Network size={13} className="mr-1.5" />
                {isEdit ? "Save Changes" : isDept ? "Add Unit" : "Add Division"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
