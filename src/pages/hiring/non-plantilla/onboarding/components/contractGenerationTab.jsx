import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
  getApplicants,
} from "@/services/hiringService";
import { getOnboardings, updateOnboarding } from "@/services/onboardingService";
import { toast } from "sonner";

const EMPTY_FORM = {
  applicant_id: "",
  employee_name: "",
  position: "",
  salary: "",
  start_date: "",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date)) return value;
  return date
    .toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export default function ContractGenerationTab({ onContractSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [contracts, setContracts] = useState([]);
  const [hiredApplicants, setHiredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingContract, setExistingContract] = useState(null);

  // FIX: useRef para palaging fresh ang contracts value sa loob ng closures
  const contractsRef = useRef([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [contractRes, applicantsRes] = await Promise.all([
        getContracts(),
        getApplicants({ status: "Hired", per_page: 500 }),
      ]);

      const arr = extractArray(contractRes);

      // FIX: i-update ang ref kasabay ng state para laging fresh ang value
      contractsRef.current = arr;
      setContracts(arr);
      setHiredApplicants(applicantsRes.data ?? []);
    } catch (err) {
      console.error("[ContractTab] loadAll error:", err);
      toast.error("FAILED TO LOAD CONTRACTS.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleApplicantSelect = (applicantId) => {
    if (!applicantId || applicantId === "__manual__") {
      setForm({ ...EMPTY_FORM, applicant_id: "" });
      setExistingContract(null);
      return;
    }

    const applicant = hiredApplicants.find(
      (a) => String(a.id) === String(applicantId),
    );

    // FIX: gamitin ang contractsRef.current para laging fresh ang value
    // Hindi na stale kahit kailan pa tinawag ito
    const found = contractsRef.current.find(
      (c) => String(c.applicant_id) === String(applicantId),
    );

    if (found) {
      setExistingContract(found);
      setForm({
        applicant_id: found.applicant_id,
        employee_name: (found.employee_name ?? "").toUpperCase(),
        position: (found.position ?? "").toUpperCase(),
        salary: found.salary ?? "",
        start_date: toDateTimeLocal(found.start_date),
      });
    } else if (applicant) {
      setExistingContract(null);
      setForm({
        applicant_id: applicant.id,
        employee_name: (applicant.full_name ?? "").toUpperCase(),
        position: (applicant.position ?? "").toUpperCase(),
        salary: "",
        start_date: "",
      });
    }
  };

  const syncStartDateToOnboarding = async (applicant_id, start_date) => {
    if (!applicant_id || !start_date) return null;
    try {
      const onboardingRes = await getOnboardings({ per_page: 500 });
      const linked = (onboardingRes.data ?? []).find(
        (o) => String(o.applicant_id) === String(applicant_id),
      );
      if (linked) {
        return await updateOnboarding(linked.id, { start_date });
      }
    } catch {
      toast.warning(
        "CONTRACT SAVED BUT FAILED TO SYNC START DATE TO ONBOARDING.",
      );
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!form.employee_name) {
      toast.error("EMPLOYEE NAME IS REQUIRED.");
      return;
    }

    setSaving(true);

    const applicantId = form.applicant_id;
    const startDate = form.start_date;
    const isUpdate = !!existingContract;
    const contractId = existingContract?.id;

    try {
      const payload = {
        applicant_id: applicantId || null,
        employee_name: form.employee_name,
        position: form.position || null,
        salary: form.salary || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        status: "Generated",
      };

      if (isUpdate) {
        await updateContract(contractId, payload);
        toast.success("CONTRACT UPDATED SUCCESSFULLY.");
      } else {
        await createContract({ ...payload, status: "Draft" });
        toast.success("CONTRACT GENERATED SUCCESSFULLY.");
      }

      setForm(EMPTY_FORM);
      setExistingContract(null);

      await loadAll(true);

      const updatedOnboarding = await syncStartDateToOnboarding(
        applicantId,
        startDate,
      );
      onContractSaved?.(updatedOnboarding);
    } catch (err) {
      console.error("[ContractTab] handleGenerate error:", err);
      toast.error(
        err?.response?.data?.message?.toUpperCase() ??
          "FAILED TO GENERATE CONTRACT.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("DELETE THIS CONTRACT?")) return;
    try {
      await deleteContract(id);
      toast.success("CONTRACT DELETED.");
      await loadAll(true);
    } catch {
      toast.error("FAILED TO DELETE CONTRACT.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {existingContract ? "UPDATE CONTRACT" : "GENERATE CONTRACT"}
          </CardTitle>
          {existingContract && (
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              THIS APPLICANT ALREADY HAS A CONTRACT. SUBMITTING WILL UPDATE IT.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              LINK TO HIRED APPLICANT{" "}
              <span className="text-xs text-gray-400 font-normal">
                (OPTIONAL — AUTO-FILLS FIELDS BELOW)
              </span>
            </label>
            <Select
              value={
                form.applicant_id ? String(form.applicant_id) : "__manual__"
              }
              onValueChange={handleApplicantSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="SELECT A HIRED APPLICANT…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__manual__">— ENTER MANUALLY —</SelectItem>
                {hiredApplicants.length === 0 && (
                  <SelectItem value="__none__" disabled>
                    NO HIRED APPLICANTS FOUND
                  </SelectItem>
                )}
                {hiredApplicants.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {(a.full_name ?? "").toUpperCase()}
                    {a.position ? ` — ${a.position.toUpperCase()}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                EMPLOYEE NAME <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="FULL NAME"
                value={form.employee_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employee_name: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                POSITION
              </label>
              <Input
                placeholder="JOB TITLE"
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                SALARY
              </label>
              <Input
                placeholder="E.G. 25000"
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                START DATE & TIME
              </label>
              <Input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={saving}>
              {saving && (
                <IconLoader2 size={14} className="animate-spin mr-2" />
              )}
              {saving
                ? existingContract
                  ? "UPDATING..."
                  : "GENERATING..."
                : existingContract
                  ? "UPDATE CONTRACT"
                  : "GENERATE CONTRACT"}
            </Button>

            {existingContract && (
              <Button
                variant="outline"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setExistingContract(null);
                }}
              >
                CANCEL
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GENERATED CONTRACTS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <IconLoader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>EMPLOYEE</TableHead>
                  <TableHead>POSITION</TableHead>
                  <TableHead>SALARY</TableHead>
                  <TableHead>START DATE & TIME</TableHead>
                  <TableHead>APPLICANT LINK</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-14 text-center text-sm text-gray-400"
                    >
                      NO CONTRACTS YET.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {(c.employee_name ?? "").toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {c.position ? c.position.toUpperCase() : "—"}
                      </TableCell>
                      <TableCell>
                        {c.salary
                          ? `₱${Number(c.salary).toLocaleString()}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {formatDateTime(c.start_date)}
                      </TableCell>
                      <TableCell>
                        {c.applicant ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                            {(c.applicant.full_name ?? "").toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {(c.status ?? "").toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(c.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <IconTrash size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
