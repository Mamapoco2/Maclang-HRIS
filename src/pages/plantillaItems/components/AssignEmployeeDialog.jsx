import { useEffect, useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  personnelScheduleService,
  getErrorMessage,
} from "@/services/personnelScheduleService";

export function AssignEmployeeDialog({ target, onOpenChange, onAssign }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [pending, setPending] = useState(null);
  const debounced = useDebounce(search, 300);

  useEffect(() => {
    setSearch("");
    setResults([]);
    setError(null);
    setPending(null);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    personnelScheduleService
      .searchEmployees(debounced.trim())
      .then((list) => {
        if (!cancelled) setResults(list);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [target, debounced]);

  const currentEmployeeId = target?.slot?.employee_id ?? null;

  const otherItems = (employee) =>
    (employee.assigned_to ?? []).filter((a) => a.slot_id !== target?.slot?.id);

  const pick = async (employee) => {
    if (assigningId) return;
    setAssigningId(employee.id);
    const res = await onAssign(target.slot.id, employee.id);
    setAssigningId(null);
    if (res.ok) onOpenChange(false);
    else setError(res.error);
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600">
              <UserPlus size={13} />
            </span>
            Assign Employee
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          <div className="text-xs text-slate-500">
            <span className="font-semibold uppercase text-slate-700">
              {target?.title}
            </span>
            <span className="font-mono ml-2 text-slate-400">
              Item {target?.slot?.item_number ?? "—"}
            </span>
          </div>

          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or number…"
              className="pl-8 h-9 text-sm border-gray-200"
            />
          </div>

          <div className="rounded-lg border border-gray-200 max-h-64 overflow-y-auto divide-y divide-gray-100">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
                <Loader2 size={13} className="animate-spin" />
                Searching…
              </div>
            )}
            {!loading && error && (
              <p className="px-3 py-6 text-center text-xs text-red-500">{error}</p>
            )}
            {!loading && !error && results.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-slate-400">
                No employees found.
              </p>
            )}
            {!loading &&
              !error &&
              results.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  disabled={!!assigningId || emp.id === currentEmployeeId}
                  onClick={() => setPending(emp)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50 disabled:opacity-60"
                >
                  <span className="text-sm text-slate-800 truncate">{emp.full_name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-slate-400">
                      {emp.employee_number}
                    </span>
                    {emp.id === currentEmployeeId && (
                      <span className="text-[10px] font-semibold uppercase text-emerald-600">
                        Current
                      </span>
                    )}
                    {assigningId === emp.id && (
                      <Loader2 size={12} className="animate-spin text-emerald-600" />
                    )}
                  </span>
                </button>
              ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            The employee is only copied into the Personnel Schedule. Nothing
            changes in Employee Management.
          </p>
        </div>
      </DialogContent>

      <AlertDialog open={!!pending} onOpenChange={(v) => !v && setPending(null)}>
        <AlertDialogContent className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 text-base font-semibold">
              {currentEmployeeId ? "Change employee?" : "Assign employee?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Assign <b>{pending?.full_name}</b> to Item{" "}
                  {target?.slot?.item_number ?? "—"} ({target?.title})?
                </p>
                {currentEmployeeId && (
                  <p>
                    This item is currently assigned to{" "}
                    <b>{target?.slot?.employee_name}</b>. They will be replaced.
                  </p>
                )}
                {pending && otherItems(pending).length > 0 && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 space-y-1">
                    <p>This employee is already assigned to:</p>
                    <ul className="list-disc pl-4">
                      {otherItems(pending)
                        .slice(0, 3)
                        .map((a) => (
                          <li key={a.slot_id}>
                            {a.title} (Item {a.item_number ?? "—"})
                          </li>
                        ))}
                    </ul>
                    {otherItems(pending).length > 3 && (
                      <p>and {otherItems(pending).length - 3} more.</p>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 h-9 px-4">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const employee = pending;
                setPending(null);
                pick(employee);
              }}
              className="text-sm text-white h-9 px-4 bg-emerald-600 hover:bg-emerald-700"
            >
              {currentEmployeeId ? "Change" : "Assign"}
              {pending && otherItems(pending).length > 0 ? " anyway" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
