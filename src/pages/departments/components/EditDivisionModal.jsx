// src/pages/departments/components/editDivisionModal.jsx
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
import { Search, X } from "lucide-react";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "OFFICE", label: "Office" },
  { value: "DIVISION", label: "Division" },
  { value: "DIRECTORATE", label: "Directorate" },
];

const TYPE_BADGE = {
  OFFICE: "bg-indigo-100 text-indigo-700",
  DIVISION: "bg-teal-100 text-teal-700",
  DIRECTORATE: "bg-purple-100 text-purple-700",
};

const HEAD_ROLES = [
  "CHIEF",
  "DIRECTOR",
  "ASSISTANT DIRECTOR",
  "OFFICER IN CHARGE",
  "CHAIRMAN",
  "HEAD",
  "SUPERVISOR",
];

const fetchAllEmployees = async () => {
  let page = 1;
  let all = [];
  while (true) {
    const res = await api.get("/employees", {
      params: { page, per_page: 100 },
    });
    const data = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
    all = [...all, ...data];
    const lastPage = res.data?.last_page ?? 1;
    if (page >= lastPage) break;
    page++;
  }
  return all;
};

const getEmployeeName = (e) =>
  `${[e.prefix, e.first_name, e.last_name, e.suffix]
    .filter(Boolean)
    .join(" ")}${e.title ? `, ${e.title}` : ""}`;

const getRolePositions = (e) => {
  const rp = e.role_position;
  if (!rp) return [];
  if (Array.isArray(rp)) return rp.map((r) => String(r).toUpperCase());
  return [String(rp).toUpperCase()];
};

export default function EditDivisionModal({
  open,
  division,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    head_employee_id: "",
    type: "DIVISION",
    parent_id: "",
  });
  const [errors, setErrors] = useState({});

  const [employees, setEmployees] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [headSearch, setHeadSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");

  useEffect(() => {
    if (open && division) {
      setForm({
        code: division.code ?? "",
        name: division.name ?? "",
        description: division.description ?? "",
        head_employee_id: division.head_employee_id
          ? String(division.head_employee_id)
          : division.head?.id
            ? String(division.head.id)
            : "",
        type: division.type ?? "DIVISION",
        parent_id: division.parent_id ? String(division.parent_id) : "",
      });
      setErrors({});
      setHeadSearch("");
      setParentSearch("");
    }
  }, [open, division]);

  useEffect(() => {
    if (!open) return;

    setLoadingEmployees(true);
    fetchAllEmployees()
      .then(setEmployees)
      .catch(() => toast.error("Failed to load employees."))
      .finally(() => setLoadingEmployees(false));

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

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const setUpper = (field, value) => set(field, value.toUpperCase());

  // Divisions that can be selected as parent:
  // - cannot be itself
  // - cannot be one of its own descendants (would create a cycle)
  const getDescendantIds = (rootId) => {
    const ids = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      divisions.forEach((d) => {
        if (
          d.parent_id != null &&
          (ids.has(d.parent_id) || d.parent_id === rootId) &&
          !ids.has(d.id)
        ) {
          ids.add(d.id);
          changed = true;
        }
      });
    }
    return ids;
  };

  const excludedIds = division
    ? new Set([division.id, ...getDescendantIds(division.id)])
    : new Set();

  const parentOptions = divisions.filter((d) => !excludedIds.has(d.id));

  const filteredParents = parentOptions.filter((d) =>
    `${d.name} ${d.code ?? ""}`
      .toLowerCase()
      .includes(parentSearch.toLowerCase()),
  );

  // Only employees holding a leadership role (Chief, Director, Assistant
  // Director, Officer in Charge, Chairman, Head, Supervisor) can be set as
  // the head of an Office/Division/Directorate.
  const headEmployees = employees.filter((e) => {
    const roles = getRolePositions(e);
    return roles.some((r) => HEAD_ROLES.includes(r));
  });

  const filteredEmployees = headEmployees.filter((e) =>
    getEmployeeName(e).toLowerCase().includes(headSearch.toLowerCase()),
  );

  const selectedParent = parentOptions.find(
    (d) => String(d.id) === form.parent_id,
  );

  const selectedHead = employees.find(
    (e) => String(e.id) === form.head_employee_id,
  );

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.type) newErrors.type = "Type is required.";
    if (!form.code.trim()) newErrors.code = "Code is required.";
    if (!form.name.trim()) newErrors.name = "Name is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await api.put(`/divisions/${division.id}`, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
        head_employee_id: form.head_employee_id || null,
        parent_id: form.parent_id || null,
      });
      toast.success("Updated successfully.");
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
          err?.response?.data?.message ?? "Failed to update division.",
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
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {typeLabel || "Division"}</DialogTitle>
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
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="pl-3 [&>span:first-child]:hidden"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Parent Office/Division/Directorate */}
          <div className="space-y-1.5">
            <Label>
              Parent{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>

            {selectedParent && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_BADGE[selectedParent.type] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {selectedParent.type}
                </span>
                <span className="text-sm font-medium flex-1 truncate">
                  {selectedParent.name}
                </span>
                <button
                  type="button"
                  onClick={() => set("parent_id", "")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {!selectedParent && (
              <Select
                value={form.parent_id}
                onValueChange={(v) => set("parent_id", v)}
                disabled={loadingDivisions}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDivisions
                        ? "Loading..."
                        : "Select parent (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="p-0 overflow-hidden">
                  <div className="px-2 py-1.5 bg-white border-b border-gray-100">
                    <div className="relative">
                      <Search
                        size={11}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        placeholder="Search office/division…"
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-indigo-400 uppercase"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {loadingDivisions ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        Loading...
                      </div>
                    ) : filteredParents.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        No options found.
                      </div>
                    ) : (
                      filteredParents.map((d) => (
                        <SelectItem
                          key={d.id}
                          value={String(d.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${TYPE_BADGE[d.type] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {d.type}
                            </span>
                            <span className="truncate">{d.name}</span>
                            {d.code && (
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {d.code}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              e.g. link this {typeLabel || "Division"} under the Medical Center
              Chief Office.
            </p>
          </div>

          {/* Code */}
          <div className="space-y-1.5">
            <Label>
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. FIN"
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
                form.type === "OFFICE"
                  ? "e.g. MEDICAL CENTER CHIEF"
                  : form.type === "DIRECTORATE"
                    ? "e.g. MEDICAL DIRECTOR"
                    : "e.g. HOSPITAL ADMINISTRATION DIVISION"
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

          {/* Head Employee */}
          <div className="space-y-1.5">
            <Label>
              {typeLabel || "Division"} Head{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>

            {selectedHead ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40">
                <span className="text-sm font-medium flex-1 truncate uppercase">
                  {getEmployeeName(selectedHead)}
                </span>
                {getRolePositions(selectedHead).length > 0 && (
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {getRolePositions(selectedHead).join(", ")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => set("head_employee_id", "")}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <Select
                value={form.head_employee_id}
                onValueChange={(v) => set("head_employee_id", v)}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingEmployees
                        ? "Loading..."
                        : `Select ${(typeLabel || "division").toLowerCase()} head`
                    }
                  />
                </SelectTrigger>
                <SelectContent className="uppercase p-0 overflow-hidden">
                  <div className="px-2 py-1.5 bg-white border-b border-gray-100">
                    <div className="relative">
                      <Search
                        size={11}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        placeholder="Search employee…"
                        value={headSearch}
                        onChange={(e) => setHeadSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-indigo-400 uppercase"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-44">
                    {loadingEmployees ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center uppercase">
                        Loading...
                      </div>
                    ) : filteredEmployees.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center uppercase">
                        No employees found.
                      </div>
                    ) : (
                      filteredEmployees.map((e) => (
                        <SelectItem
                          key={e.id}
                          value={String(e.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          <span className="flex flex-col">
                            <span>{getEmployeeName(e)}</span>
                            {getRolePositions(e).length > 0 && (
                              <span className="text-[10px] text-slate-400">
                                {getRolePositions(e).join(", ")}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
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
