// src/pages/trainings/components/trainingPeopleAssign.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconLoader2,
  IconUsersGroup,
  IconUserMinus,
  IconUserPlus,
  IconUserCheck,
} from "@tabler/icons-react";
import TrainingProgress from "./trainingProgress";
import api from "../../../api/api";
import { getEcho } from "../../../lib/echo";

function resolveAvatar(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/storage/${url}`;
}

function participantsFromTraining(training) {
  return (training?.participants ?? [])
    .filter((p) => p.id)
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatar_url: p.avatar_url ?? null,
    }));
}

// ── Save Confirmation Modal ───────────────────────────────────────────────────
function SaveConfirmModal({
  open,
  onClose,
  onConfirm,
  saving,
  toAdd,
  toRemove,
}) {
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Confirm Changes
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Review the following changes before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1 max-h-80 overflow-y-auto">
          {!hasChanges && (
            <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-4">
              No changes to save.
            </p>
          )}

          {/* To be added */}
          {toAdd.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide flex items-center gap-1.5">
                <IconUserPlus size={13} />
                Adding ({toAdd.length})
              </p>
              <div className="space-y-1">
                {toAdd.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50"
                  >
                    <Avatar url={p.avatar_url} name={p.name} size={7} />
                    <span className="text-[13px] font-medium text-green-800 dark:text-green-300 truncate">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* To be removed */}
          {toRemove.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <IconUserMinus size={13} />
                Removing ({toRemove.length})
              </p>
              <div className="space-y-1">
                {toRemove.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50"
                  >
                    <Avatar url={p.avatar_url} name={p.name} size={7} />
                    <span className="text-[13px] font-medium text-red-700 dark:text-red-300 truncate line-through">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="text-gray-600"
          >
            Go Back
          </Button>
          <Button onClick={onConfirm} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <IconLoader2 size={14} className="animate-spin mr-1" />
                Saving...
              </>
            ) : (
              <>
                <IconUserCheck size={14} className="mr-1" />
                Confirm Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TrainingAssignPeople({
  training,
  onAssign,
  open,
  onClose,
  currentEmployeeId,
}) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  // committed = server snapshot (used to diff changes and restore on Cancel)
  const [committed, setCommitted] = useState([]);
  // visible = what the user sees (committed ± local edits)
  const [visible, setVisible] = useState([]);
  // IDs from committed that the user removed locally
  const [pendingRemovals, setPendingRemovals] = useState(new Set());

  const [saving, setSaving] = useState(false);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const listenerRef = useRef(null);

  // ── Sync from training prop ───────────────────────────────────────────────
  useEffect(() => {
    if (!training?.participants) return;
    const base = participantsFromTraining(training);
    setCommitted(base);
    setVisible(base);
    setPendingRemovals(new Set());
  }, [training]);

  // ── Reset search on open/close ────────────────────────────────────────────
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // ── Fetch employees list ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setLoadingEmp(true);
    api
      .get("/employees", { params: { all: true } })
      .then((res) => setEmployees(res.data.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoadingEmp(false));
  }, [open]);

  // ── Reverb realtime ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!training?.id) return;
    const echo = getEcho();
    const channel = echo.channel("trainings");

    const handler = (e) => {
      if (e.training?.id !== training.id) return;
      const fresh = (e.training.participants ?? [])
        .filter((p) => p.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          avatar_url: p.avatar_url ?? null,
        }));

      setCommitted(fresh);
      setPendingRemovals((prev) => {
        if (prev.size === 0) setVisible(fresh);
        return prev;
      });
    };

    channel.listen(".participant.updated", handler);
    listenerRef.current = handler;

    return () => {
      channel.stopListening(".participant.updated", listenerRef.current);
    };
  }, [training?.id]);

  // ── Derive toAdd / toRemove for the confirm modal ─────────────────────────
  // toAdd  = in visible but NOT in committed (newly added this session)
  const toAdd = visible.filter((v) => !committed.find((c) => c.id === v.id));
  // toRemove = in committed but NOT in visible (removed this session)
  const toRemove = committed.filter((c) => !visible.find((v) => v.id === c.id));

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredEmployees = employees.filter((e) => {
    const name = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) &&
      !visible.find((s) => s.id === e.id) &&
      e.id !== currentEmployeeId
    );
  });

  // ── Add employee ──────────────────────────────────────────────────────────
  const addEmployee = (emp) => {
    const name = [emp.prefix, emp.first_name, emp.last_name, emp.suffix]
      .filter(Boolean)
      .join(" ");
    const entry = {
      id: emp.id,
      name,
      avatar_url: resolveAvatar(emp.avatar_url),
    };
    setVisible((prev) => [...prev, entry]);
    setPendingRemovals((prev) => {
      const next = new Set(prev);
      next.delete(emp.id);
      return next;
    });
    setSearch("");
  };

  // ── Remove — hide immediately, queue deletion for Save ───────────────────
  const removeEmployee = (id) => {
    setVisible((prev) => prev.filter((s) => s.id !== id));
    if (committed.find((c) => c.id === id)) {
      setPendingRemovals((prev) => new Set([...prev, id]));
    }
  };

  // ── Cancel — restore everything to committed state ────────────────────────
  const handleCancel = () => {
    setVisible(committed);
    setPendingRemovals(new Set());
    setSearch("");
    onClose(false);
  };

  // ── Open save confirm — only if there are actual changes ──────────────────
  const handleSaveClick = () => {
    if (toAdd.length === 0 && toRemove.length === 0) return;
    setSaveConfirmOpen(true);
  };

  // ── Confirmed save — apply all changes ───────────────────────────────────
  const handleConfirmSave = async () => {
    try {
      setSaving(true);

      // Delete each pending removal from the server first
      if (pendingRemovals.size > 0) {
        await Promise.all(
          [...pendingRemovals].map((empId) =>
            api.delete(`/trainings/${training.id}/participants/${empId}`),
          ),
        );
      }

      // Sync the final visible list
      await onAssign(
        training.id,
        visible.map((s) => s.id),
      );

      setSaveConfirmOpen(false);
      onClose(false);
    } catch {
      // handled upstream
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold">
              Assign Participants
            </DialogTitle>
            <DialogDescription>
              Search and assign employees. Removed participants are restored if
              you cancel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Progress */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Training Progress</p>
              <TrainingProgress value={training?.progress || 0} />
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee to add..."
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-44 overflow-y-auto">
                  {loadingEmp ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      <IconLoader2
                        size={14}
                        className="animate-spin inline mr-1"
                      />
                      Loading...
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No results
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => addEmployee(emp)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5"
                      >
                        <Avatar
                          url={resolveAvatar(emp.avatar_url)}
                          name={`${emp.first_name} ${emp.last_name}`}
                          size={7}
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {emp.first_name} {emp.last_name}
                          </p>
                          {emp.department && (
                            <p className="text-xs text-muted-foreground truncate">
                              {emp.department}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Pending changes summary strip */}
            {hasChanges && (
              <div className="flex items-center gap-2 flex-wrap">
                {toAdd.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                    <IconUserPlus size={11} />
                    {toAdd.length} to add
                  </span>
                )}
                {toRemove.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    <IconUserMinus size={11} />
                    {toRemove.length} to remove
                  </span>
                )}
              </div>
            )}

            {/* Participant list */}
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-1.5">
                  <IconUsersGroup size={28} className="opacity-30" />
                  <p className="text-sm">No participants assigned yet</p>
                  <p className="text-xs opacity-60">
                    Search above to add employees
                  </p>
                </div>
              ) : (
                visible.map((s) => {
                  const isNewlyAdded = !committed.find((c) => c.id === s.id);
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isNewlyAdded
                          ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar url={s.avatar_url} name={s.name} size={7} />
                        <span className="truncate text-gray-800 dark:text-gray-200 text-[13px]">
                          {s.name}
                        </span>
                        {isNewlyAdded && (
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                            new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmployee(s.id)}
                        title="Remove participant"
                        className="ml-2 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <IconUserMinus size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick} disabled={saving || !hasChanges}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save confirmation modal */}
      <SaveConfirmModal
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        saving={saving}
        toAdd={toAdd}
        toRemove={toRemove}
      />
    </>
  );
}

// ── Avatar component ──────────────────────────────────────────────────────────
function Avatar({ url, name = "", size = 7 }) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = `w-${size} h-${size}`;

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
