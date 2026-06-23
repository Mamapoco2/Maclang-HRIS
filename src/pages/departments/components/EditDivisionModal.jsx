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
  { value: "OFFICE", label: "OFFICE" },
  { value: "DIVISION", label: "DIVISION" },
  { value: "DIRECTORATE", label: "DIRECTORATE" },
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
      .then((res) =>
        setDivisions(
          Array.isArray(res.data) ? res.data : (res.data?.data ?? []),
        ),
      )
      .catch(() => toast.error("Failed to load divisions."))
      .finally(() => setLoadingDivisions(false));
  }, [open]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };
  const setUpper = (field, value) => set(field, value.toUpperCase());

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
  const headEmployees = employees.filter((e) =>
    getRolePositions(e).some((r) => HEAD_ROLES.includes(r)),
  );
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
            EDIT {typeLabel || "DIVISION"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Scrollable Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                  onClick={() => set("parent_id", "")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <Select
                value={form.parent_id}
                onValueChange={(v) => set("parent_id", v)}
                disabled={loadingDivisions}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDivisions
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
                        placeholder="SEARCH OFFICE / DIVISION..."
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
                        LOADING...
                      </div>
                    ) : filteredParents.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        NO OPTIONS FOUND.
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
              E.G. LINK THIS {typeLabel || "DIVISION"} UNDER THE MEDICAL CENTER
              CHIEF OFFICE.
            </p>
          </div>

          {/* Code */}
          <div className="space-y-1.5">
            <Label>
              CODE <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="E.G. FIN"
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
                form.type === "OFFICE"
                  ? "E.G. MEDICAL CENTER CHIEF"
                  : form.type === "DIRECTORATE"
                    ? "E.G. MEDICAL DIRECTOR"
                    : "E.G. HOSPITAL ADMINISTRATION DIVISION"
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

          {/* Division Head */}
          <div className="space-y-1.5">
            <Label>
              {typeLabel || "DIVISION"} HEAD{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (OPTIONAL)
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
                        ? "LOADING..."
                        : `SELECT ${(typeLabel || "DIVISION").toUpperCase()} HEAD`
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
                    ) : filteredEmployees.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center uppercase">
                        NO EMPLOYEES FOUND.
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
