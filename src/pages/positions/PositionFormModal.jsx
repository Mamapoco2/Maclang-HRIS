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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

const defaults = { title: "", description: "" };

/**
 * Reusable add / edit modal for COS and Consultant positions.
 *
 * Props
 * ─────
 * open          boolean
 * onOpenChange  (v: boolean) => void
 * position      object | null   — when set, modal is in edit mode
 * service       { create, update }
 * label         string          — "COS" | "Consultant"
 * onSuccess     () => void
 */
export default function PositionFormModal({
  open,
  onOpenChange,
  position,
  service,
  label,
  onSuccess,
}) {
  const isEdit = !!position;
  const form = useForm({ defaultValues: defaults });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset(
        isEdit
          ? { title: position.title ?? "", description: position.description ?? "" }
          : defaults,
      );
    }
  }, [open, position]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        await service.update(position.id, data);
        toast.success(`${label} position updated.`);
      } else {
        await service.create(data);
        toast.success(`${label} position created.`);
      }
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
      <DialogContent className="sm:max-w-[460px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
              {isEdit ? <Pencil size={13} /> : <Plus size={13} />}
            </span>
            {isEdit ? `Edit ${label} Position` : `Add ${label} Position`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-6 py-5 space-y-4"
          >
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
                      placeholder={`e.g. ${label === "COS" ? "DATA ENCODER I" : "IT CONSULTANT"}`}
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
                      placeholder="Brief description of this position…"
                      className="text-sm border-gray-200 resize-none"
                      rows={3}
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
                className="text-sm bg-gray-900 hover:bg-black text-white h-9"
              >
                {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isEdit ? "Save Changes" : "Add Position"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
