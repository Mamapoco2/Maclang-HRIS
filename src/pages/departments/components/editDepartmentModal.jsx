import { useEffect, useState } from "react";
import api from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "DEPARTMENT", label: "DEPARTMENT" },
  { value: "UNIT", label: "UNIT" },
  { value: "SECTION", label: "SECTION" },
];
export default function EditDepartmentModal({
  open,
  onClose,
  onSuccess,
  department,
}) {
  const [divisions, setDivisions] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: "",
    division_id: "",
    code: "",
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch divisions on open
  useEffect(() => {
    if (!open) return;
    setLoadingDivisions(true);
    api
      .get("/divisions")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        setDivisions(list);
      })
      .catch(() => toast.error("Failed to load divisions."))
      .finally(() => setLoadingDivisions(false));
  }, [open]);

  // Pre-fill form when department changes
  useEffect(() => {
    if (open && department) {
      setForm({
        type: department.type ?? "",
        division_id: department.division_id
          ? String(department.division_id)
          : "",
        code: department.code ?? "",
        name: department.name ?? "",
        description: department.description ?? "",
      });
      setErrors({});
    }
  }, [open, department]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Auto-uppercase for text inputs
  const setUpper = (field, value) => set(field, value.toUpperCase());

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.type) newErrors.type = "Type is required.";
    if (!form.division_id) newErrors.division_id = "Division is required.";
    if (!form.code.trim()) newErrors.code = "Code is required.";
    if (!form.name.trim()) newErrors.name = "Name is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await api.put(`/departments/${department.id}`, {
        type: form.type,
        division_id: form.division_id,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      toast.success("Department updated successfully.");
      onSuccess?.();
      onClose();
    } catch (err) {
      const serverErrors = err.response?.data?.errors ?? {};
      if (Object.keys(serverErrors).length > 0) {
        const mapped = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        toast.error(
          err.response?.data?.message ?? "Failed to update department.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const typeLabel =
    TYPE_OPTIONS.find((o) => o.value === form.type)?.label ?? "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit {typeLabel || "Department"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type */}
          <div className="space-y-1.5">
            <Label>
              Type <span className="text-destructive">*</span>
            </Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger
                className={errors.type ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Division */}
          <div className="space-y-1.5">
            <Label>
              Division <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.division_id}
              onValueChange={(v) => set("division_id", v)}
              disabled={loadingDivisions}
            >
              <SelectTrigger
                className={errors.division_id ? "border-destructive" : ""}
              >
                <SelectValue
                  placeholder={
                    loadingDivisions ? "Loading..." : "Select division"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={String(div.id)}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.division_id && (
              <p className="text-xs text-destructive">{errors.division_id}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-1.5">
            <Label>
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. MED-01"
              value={form.code}
              onChange={(e) => setUpper("code", e.target.value)}
              className={errors.code ? "border-destructive" : ""}
              maxLength={50}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder={
                form.type === "UNIT"
                  ? "e.g. RADIOLOGY UNIT"
                  : form.type === "SECTION"
                    ? "e.g. OUTPATIENT SECTION"
                    : "e.g. MEDICAL SERVICE"
              }
              value={form.name}
              onChange={(e) => setUpper("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
              maxLength={255}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="OPTIONAL DESCRIPTION..."
              value={form.description}
              onChange={(e) => setUpper("description", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
