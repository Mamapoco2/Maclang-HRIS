import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";

const LABEL = "text-xs font-semibold uppercase tracking-widest text-gray-400";

function toDraft(row) {
  return {
    title: row.title,
    sg: row.sg == null ? "" : String(row.sg),
    slots: row.slotList.map((s) => ({
      key: `slot-${s.id}`,
      id: s.id,
      item_number: s.item_number ?? "",
      employee_id: s.employee_id,
      employee_name: s.employee_name,
    })),
  };
}

function validate(draft) {
  const errors = { slots: {} };
  const title = draft.title.trim();

  if (!title) errors.title = "Position title is required";
  else if (title.length > 255) errors.title = "Title must be 255 characters or fewer";

  if (draft.sg.trim() !== "") {
    const sg = Number(draft.sg);
    if (!Number.isInteger(sg) || sg < 1 || sg > 33)
      errors.sg = "Salary grade must be a whole number from 1 to 33";
  }

  if (draft.slots.length === 0) errors.slotList = "A position needs at least one slot";

  draft.slots.forEach((s) => {
    if (s.item_number.trim().length > 20)
      errors.slots[s.key] = "Item number must be 20 characters or fewer";
  });

  const hasError =
    errors.title || errors.sg || errors.slotList || Object.keys(errors.slots).length > 0;
  return { errors, hasError: !!hasError };
}

export function EditPositionDialog({ row, onOpenChange, onSave }) {
  const [draft, setDraft] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    setDraft(row ? toDraft(row) : null);
    setShowErrors(false);
    setConfirming(false);
    setServerError(null);
  }, [row]);

  const { errors, hasError } = useMemo(
    () => (draft ? validate(draft) : { errors: { slots: {} }, hasError: false }),
    [draft],
  );

  const changes = useMemo(() => {
    if (!row || !draft) return null;
    const original = toDraft(row);
    const keptIds = new Set(draft.slots.filter((s) => s.id).map((s) => s.id));
    return {
      title: draft.title.trim() !== original.title,
      sg: draft.sg.trim() !== original.sg,
      added: draft.slots.filter((s) => !s.id).length,
      removed: original.slots.filter((s) => !keptIds.has(s.id)).length,
      renumbered: draft.slots.filter((s) => {
        const before = original.slots.find((o) => o.id === s.id);
        return before && before.item_number.trim() !== s.item_number.trim();
      }).length,
    };
  }, [row, draft]);

  const dirty =
    changes &&
    (changes.title || changes.sg || changes.added || changes.removed || changes.renumbered);

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const updateSlot = (key, value) =>
    update({
      slots: draft.slots.map((s) => (s.key === key ? { ...s, item_number: value } : s)),
    });
  const addSlot = () =>
    update({
      slots: [
        ...draft.slots,
        { key: `new-${Date.now()}-${draft.slots.length}`, id: null, item_number: "", employee_id: null },
      ],
    });
  const removeSlot = (key) => update({ slots: draft.slots.filter((s) => s.key !== key) });

  const requestSave = () => {
    setShowErrors(true);
    if (hasError || !dirty) return;
    setConfirming(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    setServerError(null);
    const res = await onSave(row.key, {
      title: draft.title.trim(),
      salary_grade: draft.sg.trim() === "" ? null : Number(draft.sg),
      slots: draft.slots.map((s) => ({
        id: s.id,
        item_number: s.item_number.trim() === "" ? null : s.item_number.trim(),
      })),
    });
    setSaving(false);
    setConfirming(false);
    if (res.ok) onOpenChange(false);
    else setServerError(res.error);
  };

  if (!draft) return null;

  return (
    <Dialog open={!!row} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600">
              <Pencil size={13} />
            </span>
            Edit Position
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-1.5">
            <p className={LABEL}>Position Title</p>
            <Input
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              className="h-9 text-sm border-gray-200"
            />
            {showErrors && errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className={LABEL}>Salary Grade</p>
            <Input
              inputMode="numeric"
              value={draft.sg}
              onChange={(e) => update({ sg: e.target.value })}
              placeholder="—"
              className="h-9 w-28 text-sm border-gray-200"
            />
            {showErrors && errors.sg && <p className="text-xs text-red-500">{errors.sg}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={LABEL}>Item Numbers / Slots ({draft.slots.length})</p>
              <Button
                type="button"
                variant="outline"
                className="h-7 px-2.5 text-xs border-gray-200 text-gray-600"
                onClick={addSlot}
              >
                <Plus size={12} className="mr-1.5" />
                Add slot
              </Button>
            </div>

            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {draft.slots.map((slot) => (
                <div key={slot.key} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-32 shrink-0">
                    <Input
                      value={slot.item_number}
                      onChange={(e) => updateSlot(slot.key, e.target.value)}
                      placeholder="Item no."
                      className="h-8 text-sm font-mono border-gray-200"
                    />
                    {showErrors && errors.slots[slot.key] && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.slots[slot.key]}</p>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    {slot.employee_id ? (
                      <span className="text-slate-700 truncate block">{slot.employee_name}</span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                        {slot.id ? "Open" : "New"}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    title={
                      slot.employee_id
                        ? "Remove the assigned employee first"
                        : "Remove this slot"
                    }
                    disabled={!!slot.employee_id}
                    className="h-7 px-2 text-slate-400 hover:text-red-600"
                    onClick={() => removeSlot(slot.key)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
            {showErrors && errors.slotList && (
              <p className="text-xs text-red-500">{errors.slotList}</p>
            )}
            <p className="text-[11px] text-gray-400">
              Slots with an assigned employee can't be removed. Clear the
              assignment first.
            </p>
          </div>

          {serverError && <p className="text-xs text-red-500">{serverError}</p>}

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
              type="button"
              disabled={!dirty || saving}
              onClick={requestSave}
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white h-9"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={confirming} onOpenChange={(v) => !v && !saving && setConfirming(false)}>
        <AlertDialogContent className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 text-base font-semibold">
              Save changes to this position?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                <ul className="list-disc pl-4">
                  {changes?.title && <li>Position title will be updated.</li>}
                  {changes?.sg && <li>Salary grade will be updated.</li>}
                  {changes?.renumbered > 0 && (
                    <li>
                      {changes.renumbered} item number{changes.renumbered !== 1 ? "s" : ""} will be changed.
                    </li>
                  )}
                  {changes?.added > 0 && (
                    <li>
                      {changes.added} slot{changes.added !== 1 ? "s" : ""} will be added.
                    </li>
                  )}
                  {changes?.removed > 0 && (
                    <li className="text-red-600">
                      {changes.removed} open slot{changes.removed !== 1 ? "s" : ""} will be deleted.
                    </li>
                  )}
                </ul>
                <p className="text-xs text-slate-500">
                  This only affects the Personnel Schedule.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={saving}
              className="text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 h-9 px-4"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                confirmSave();
              }}
              className="text-sm text-white h-9 px-4 bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
