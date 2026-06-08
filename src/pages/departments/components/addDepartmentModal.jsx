// src/pages/departments/components/addDepartmentModal.jsx
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
import { Search } from "lucide-react";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "DEPARTMENT", label: "DEPARTMENT" },
  { value: "UNIT", label: "UNIT" },
  { value: "SECTION", label: "SECTION" },
];

const HEAD_ROLES = [
  "CHIEF",
  "DIRECTOR",
  "ASSISTANT DIRECTOR",
  "OFFICER IN CHARGE",
  "CHAIRMAN",
  "HEAD",
  "SUPERVISOR",
];

const STAFF_ROLES = ["STAFF"];

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

export default function AddDepartmentModal({ open, onClose, onSuccess }) {
  const [divisions, setDivisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);
  const [headSearch, setHeadSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [form, setForm] = useState({
    type: "",
    division_id: "",
    code: "",
    name: "",
    description: "",
    employee_head_id: "",
    employee_ids: [],
  });

  const [errors, setErrors] = useState({});

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

    setLoadingEmployees(true);
    fetchAllEmployees()
      .then(setEmployees)
      .catch(() => toast.error("Failed to load employees."))
      .finally(() => setLoadingEmployees(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm({
        type: "",
        division_id: "",
        code: "",
        name: "",
        description: "",
        employee_head_id: "",
        employee_ids: [],
      });
      setErrors({});
      setHeadSearch("");
      setEmployeeSearch("");
    }
  }, [open]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const setUpper = (field, value) => set(field, value.toUpperCase());

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

  const headEmployees = employees.filter((e) => {
    const roles = getRolePositions(e);
    return roles.some((r) => HEAD_ROLES.includes(r));
  });

  const staffEmployees = employees.filter((e) => {
    const roles = getRolePositions(e);
    return roles.some((r) => STAFF_ROLES.includes(r));
  });

  const filteredHeadEmployees = headEmployees.filter((e) =>
    getEmployeeName(e).toLowerCase().includes(headSearch.toLowerCase()),
  );

  const filteredEmployees = staffEmployees.filter((e) =>
    getEmployeeName(e).toLowerCase().includes(employeeSearch.toLowerCase()),
  );

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
      await api.post("/departments", {
        type: form.type,
        division_id: form.division_id,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        employee_head_id: form.employee_head_id || null,
        employee_ids: form.employee_ids.map(Number),
      });
      toast.success(`${typeLabel} created successfully.`);
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
        toast.error(err.response?.data?.message ?? "Failed to save.");
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
          <DialogTitle>
            Add {typeLabel || "Department / Unit / Section"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
                  <SelectItem
                    key={div.id}
                    value={String(div.id)}
                    className="pl-3 [&>span:first-child]:hidden"
                  >
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.division_id && (
              <p className="text-xs text-destructive">{errors.division_id}</p>
            )}
          </div>

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

          {/* Employee Head — only HEAD_ROLES */}
          <div className="space-y-1.5">
            <Label>
              Employee Head{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (Chief, Director, Head, etc.)
              </span>
            </Label>
            <Select
              value={form.employee_head_id}
              onValueChange={(v) => set("employee_head_id", v)}
              disabled={loadingEmployees}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingEmployees ? "Loading..." : "Select employee head"
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
                  ) : filteredHeadEmployees.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center uppercase">
                      No employees found.
                    </div>
                  ) : (
                    filteredHeadEmployees.map((e) => (
                      <SelectItem
                        key={e.id}
                        value={String(e.id)}
                        className="pl-3 [&>span:first-child]:hidden"
                      >
                        <span className="flex flex-col">
                          <span>{getEmployeeName(e)}</span>
                          <span className="text-[10px] text-slate-400">
                            {getRolePositions(e).join(", ")}
                          </span>
                        </span>
                      </SelectItem>
                    ))
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Employees — only STAFF */}
          <div className="space-y-1.5">
            <Label>
              Employees{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (select all that apply)
              </span>
            </Label>
            <Select
              value=""
              onValueChange={(v) => {
                const strId = String(v);
                setForm((prev) => ({
                  ...prev,
                  employee_ids: prev.employee_ids.includes(strId)
                    ? prev.employee_ids.filter((e) => e !== strId)
                    : [...prev.employee_ids, strId],
                }));
              }}
              disabled={loadingEmployees}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingEmployees
                      ? "Loading..."
                      : form.employee_ids.length > 0
                        ? `${form.employee_ids.length} employee(s) selected`
                        : "Select employees"
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
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
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
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No employees found.
                    </div>
                  ) : (
                    filteredEmployees.map((e) => {
                      const selected = form.employee_ids.includes(String(e.id));
                      return (
                        <SelectItem
                          key={e.id}
                          value={String(e.id)}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                                selected ? "bg-indigo-600" : "bg-gray-200"
                              }`}
                            />
                            {getEmployeeName(e)}
                          </span>
                        </SelectItem>
                      );
                    })
                  )}
                </div>
              </SelectContent>
            </Select>

            {/* Selected employee chips */}
            {form.employee_ids.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.employee_ids.map((id) => {
                  const emp = employees.find((e) => String(e.id) === id);
                  if (!emp) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase"
                    >
                      {getEmployeeName(emp)}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            employee_ids: prev.employee_ids.filter(
                              (e) => e !== id,
                            ),
                          }))
                        }
                        className="hover:text-indigo-900 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : `Create ${typeLabel || "Record"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
