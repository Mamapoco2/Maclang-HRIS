// src/pages/departments/components/editDepartmentModal.jsx
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

const TYPE_BADGE = {
  OFFICE: "bg-indigo-100 text-indigo-700",
  DIRECTORATE: "bg-purple-100 text-purple-700",
  DIVISION: "bg-teal-100 text-teal-700",
  DEPARTMENT: "bg-blue-100 text-blue-700",
  UNIT: "bg-emerald-100 text-emerald-700",
  SECTION: "bg-violet-100 text-violet-700",
};

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

export default function EditDepartmentModal({
  open,
  onClose,
  onSuccess,
  department,
}) {
  const [divisions, setDivisions] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDivisions, setAllDivisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [headSearch, setHeadSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");

  const [form, setForm] = useState({
    type: "",
    division_id: "",
    parent_id: "",
    parent_type: "",
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
      .then((res) =>
        setDivisions(
          Array.isArray(res.data) ? res.data : (res.data?.data ?? []),
        ),
      )
      .catch(() => toast.error("Failed to load divisions."))
      .finally(() => setLoadingDivisions(false));

    setLoadingDepartments(true);
    Promise.all([api.get("/departments"), api.get("/divisions")])
      .then(([deptRes, divRes]) => {
        const depts = Array.isArray(deptRes.data)
          ? deptRes.data
          : (deptRes.data?.data ?? []);
        const divs = Array.isArray(divRes.data)
          ? divRes.data
          : (divRes.data?.data ?? []);
        setAllDepartments(depts.filter((d) => d.id !== department?.id));
        setAllDivisions(divs);
      })
      .catch(() => toast.error("Failed to load departments."))
      .finally(() => setLoadingDepartments(false));

    setLoadingEmployees(true);
    fetchAllEmployees()
      .then(setEmployees)
      .catch(() => toast.error("Failed to load employees."))
      .finally(() => setLoadingEmployees(false));
  }, [open]);

  useEffect(() => {
    if (open && department) {
      const hasParentDivision = !!department.parent_division_id;
      const hasParentDept = !!department.parent_id;
      setForm({
        type: department.type ?? "",
        division_id: department.division_id
          ? String(department.division_id)
          : "",
        parent_id: hasParentDivision
          ? String(department.parent_division_id)
          : hasParentDept
            ? String(department.parent_id)
            : "",
        parent_type: hasParentDivision
          ? "division"
          : hasParentDept
            ? "department"
            : "",
        code: department.code ?? "",
        name: department.name ?? "",
        description: department.description ?? "",
        employee_head_id: department.head_employee_id
          ? String(department.head_employee_id)
          : department.head?.id
            ? String(department.head.id)
            : "",
        employee_ids: [],
      });
      setErrors({});
      setHeadSearch("");
      setEmployeeSearch("");
      setParentSearch("");
    }
  }, [open, department]);

  useEffect(() => {
    if (!open || !department?.id) return;
    setLoadingAssigned(true);
    api
      .get("/employees", {
        params: { department_id: department.id, per_page: 999 },
      })
      .then((res) => {
        const list =
          res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
        setForm((prev) => ({
          ...prev,
          employee_ids: list.map((e) => String(e.id)),
        }));
      })
      .catch(() => {})
      .finally(() => setLoadingAssigned(false));
  }, [open, department?.id]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };
  const setUpper = (field, value) => set(field, value.toUpperCase());

  const getEmployeeName = (e) => {
    const baseName = [e.prefix, e.first_name, e.last_name, e.suffix]
      .filter(Boolean)
      .join(" ");
    const title = Array.isArray(e.title)
      ? e.title.filter(Boolean).join(", ")
      : (e.title ?? "").toString().trim();
    return title ? `${baseName}, ${title}` : baseName;
  };

  const getRolePositions = (e) => {
    const rp = e.role_position;
    if (!rp) return [];
    if (Array.isArray(rp)) return rp.map((r) => String(r).toUpperCase());
    return [String(rp).toUpperCase()];
  };

  const headEmployees = employees.filter((e) =>
    getRolePositions(e).some((r) => HEAD_ROLES.includes(r)),
  );
  const staffEmployees = employees.filter(
    (e) => !getRolePositions(e).some((r) => HEAD_ROLES.includes(r)),
  );
  const filteredHeadEmployees = headEmployees.filter((e) =>
    getEmployeeName(e).toLowerCase().includes(headSearch.toLowerCase()),
  );
  const filteredEmployees = staffEmployees.filter((e) =>
    getEmployeeName(e).toLowerCase().includes(employeeSearch.toLowerCase()),
  );

  const normalizedDivisions = allDivisions.map((div) => ({
    ...div,
    type: div.type ?? "DIVISION",
    _source: "division",
  }));
  const normalizedDepartments = allDepartments.map((d) => ({
    ...d,
    _source: "department",
  }));
  const allParents = [...normalizedDivisions, ...normalizedDepartments];
  const filteredParents = allParents.filter((d) =>
    `${d.name} ${d.code ?? ""}`
      .toLowerCase()
      .includes(parentSearch.toLowerCase()),
  );
  const selectedParent = allParents.find(
    (d) => String(d.id) === form.parent_id && d._source === form.parent_type,
  );
  const selectedHead = employees.find(
    (e) => String(e.id) === form.employee_head_id,
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
      await api.put(`/departments/${department.id}`, {
        type: form.type,
        division_id: form.division_id,
        parent_id:
          form.parent_type === "department" ? form.parent_id || null : null,
        parent_division_id:
          form.parent_type === "division" ? form.parent_id || null : null,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        head_employee_id: form.employee_head_id || null,
        employee_ids: form.employee_ids.map(Number),
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
        toast.error(err.response?.data?.message ?? "Failed to update.");
      }
    } finally {
      setSaving(false);
    }
  };

  const typeLabel =
    TYPE_OPTIONS.find((o) => o.value === form.type)?.label ?? "";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[480px] flex flex-col max-h-[90vh] p-0 gap-0"
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-base">
            EDIT {typeLabel || "DEPARTMENT"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Scrollable Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Division */}
          <div className="space-y-1.5">
            <Label>
              DIVISION <span className="text-destructive">*</span>
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
                    loadingDivisions ? "LOADING..." : "SELECT DIVISION"
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
              TYPE <span className="text-destructive">*</span>
            </Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger
                className={errors.type ? "border-destructive" : ""}
              >
                <SelectValue placeholder="SELECT TYPE" />
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

          {/* Parent */}
          <div className="space-y-1.5">
            <Label>
              PARENT{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (OPTIONAL)
              </span>
            </Label>
            {selectedParent ? (
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
                  onClick={() => {
                    set("parent_id", "");
                    set("parent_type", "");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <Select
                value={form.parent_id}
                onValueChange={(v) => {
                  const found = allParents.find((d) => String(d.id) === v);
                  set("parent_id", v);
                  set("parent_type", found?._source ?? "");
                }}
                disabled={loadingDepartments}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDepartments
                        ? "LOADING..."
                        : "SELECT PARENT (OPTIONAL)"
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
                        placeholder="SEARCH DIVISION OR DEPARTMENT..."
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-indigo-400 uppercase"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {loadingDepartments ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        LOADING...
                      </div>
                    ) : filteredParents.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        NO RESULTS FOUND.
                      </div>
                    ) : (
                      filteredParents.map((d) => (
                        <SelectItem
                          key={`${d._source}-${d.id}`}
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
          </div>

          {/* Code */}
          <div className="space-y-1.5">
            <Label>
              CODE <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="E.G. MED-01"
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
              NAME <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder={
                form.type === "UNIT"
                  ? "E.G. RADIOLOGY UNIT"
                  : form.type === "SECTION"
                    ? "E.G. OUTPATIENT SECTION"
                    : "E.G. MEDICAL SERVICE"
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
            <Label>DESCRIPTION</Label>
            <Textarea
              placeholder="OPTIONAL DESCRIPTION..."
              value={form.description}
              onChange={(e) => setUpper("description", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Employee Head */}
          <div className="space-y-1.5">
            <Label>
              EMPLOYEE HEAD{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (CHIEF, DIRECTOR, HEAD, ETC.)
              </span>
            </Label>
            {selectedHead ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40">
                <span className="text-sm font-medium flex-1 truncate uppercase">
                  {getEmployeeName(selectedHead)}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {getRolePositions(selectedHead).join(", ")}
                </span>
                <button
                  type="button"
                  onClick={() => set("employee_head_id", "")}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <Select
                value={form.employee_head_id}
                onValueChange={(v) => set("employee_head_id", v)}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingEmployees ? "LOADING..." : "SELECT EMPLOYEE HEAD"
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
                        placeholder="SEARCH EMPLOYEE..."
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
                        LOADING...
                      </div>
                    ) : filteredHeadEmployees.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center uppercase">
                        NO EMPLOYEES FOUND.
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
            )}
          </div>

          {/* Employees */}
          <div className="space-y-1.5">
            <Label>
              EMPLOYEES{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (SELECT ALL THAT APPLY)
              </span>
            </Label>
            {loadingAssigned ? (
              <div className="px-3 py-3 text-xs text-slate-400 text-center border border-border rounded-lg">
                LOADING ASSIGNED EMPLOYEES...
              </div>
            ) : (
              <Select
                value=""
                onValueChange={(v) => {
                  const strId = String(v);
                  setForm((prev) => ({
                    ...prev,
                    employee_ids: prev.employee_ids.includes(strId)
                      ? prev.employee_ids.filter((id) => id !== strId)
                      : [...prev.employee_ids, strId],
                  }));
                }}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingEmployees
                        ? "LOADING..."
                        : form.employee_ids.length > 0
                          ? `${form.employee_ids.length} EMPLOYEE(S) SELECTED`
                          : "SELECT EMPLOYEES"
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
                        placeholder="SEARCH EMPLOYEE..."
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
                        LOADING...
                      </div>
                    ) : filteredEmployees.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        NO EMPLOYEES FOUND.
                      </div>
                    ) : (
                      filteredEmployees.map((e) => {
                        const selected = form.employee_ids.includes(
                          String(e.id),
                        );
                        return (
                          <SelectItem
                            key={e.id}
                            value={String(e.id)}
                            className="pl-3 [&>span:first-child]:hidden"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${selected ? "bg-indigo-600" : "bg-gray-200"}`}
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
            )}

            {form.employee_ids.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.employee_ids.map((id) => {
                  const emp = employees.find((e) => String(e.id) === id);
                  return (
                    <span
                      key={id}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border uppercase ${emp ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}
                    >
                      {emp ? getEmployeeName(emp) : `EMPLOYEE #${id}`}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            employee_ids: prev.employee_ids.filter(
                              (i) => i !== id,
                            ),
                          }))
                        }
                        className="hover:opacity-70 leading-none"
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

        {/* ── Fixed Footer ─────────────────────────────────────────────── */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            CANCEL
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
