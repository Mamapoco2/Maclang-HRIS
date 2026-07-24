import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { Button, Input, Textarea, Label, Select, Modal } from "./ui";
import { FormSection } from "./posting/PostingForm";
import {
  INTERVIEW_STAGE_STATUS_OPTIONS,
  INTERVIEW_OVERALL_STATUS_OPTIONS,
} from "./constants";

const EMPTY_INTERVIEW = {
  hr_status: "",
  head_status: "",
  final_status: "",
  overall_status: "",
  hr_scheduled_at: "",
  head_scheduled_at: "",
  final_scheduled_at: "",
  hr_notes: "",
  head_notes: "",
  final_notes: "",
};

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function InterviewDialog({ application, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_INTERVIEW);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!application) return;
    const existing = application.interview;
    setForm({
      hr_status: existing?.hr_status ?? "",
      head_status: existing?.head_status ?? "",
      final_status: existing?.final_status ?? "",
      overall_status: existing?.overall_status ?? "",
      hr_scheduled_at: toDatetimeLocal(existing?.hr_scheduled_at),
      head_scheduled_at: toDatetimeLocal(existing?.head_scheduled_at),
      final_scheduled_at: toDatetimeLocal(existing?.final_scheduled_at),
      hr_notes: existing?.hr_notes ?? "",
      head_notes: existing?.head_notes ?? "",
      final_notes: existing?.final_notes ?? "",
    });
  }, [application?.id]);

  if (!application) return <Modal open={false} onClose={onClose} />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await plantillaPostingService.saveApplicationInterview(
        application.id,
        payload,
      );
      toast?.success?.("Na-save ang interview.");
      onSaved();
    } catch (err) {
      toast?.error?.(
        err?.response?.data?.message ?? "Hindi na-save ang interview.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!application}
      onClose={() => !saving && onClose()}
      widthClass="max-w-2xl"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Schedule / Update Interview
        </h2>
        <button
          onClick={() => !saving && onClose()}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <FormSection title="HR Interview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select
                value={form.hr_status}
                onChange={(v) => set("hr_status", v)}
                options={INTERVIEW_STAGE_STATUS_OPTIONS.map((v) => ({
                  value: v,
                  label: v,
                }))}
                placeholder="Select status"
              />
            </div>
            <div>
              <Label>Scheduled At</Label>
              <Input
                type="datetime-local"
                value={form.hr_scheduled_at}
                onChange={(e) => set("hr_scheduled_at", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.hr_notes}
                onChange={(e) => set("hr_notes", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Department Head Interview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select
                value={form.head_status}
                onChange={(v) => set("head_status", v)}
                options={INTERVIEW_STAGE_STATUS_OPTIONS.map((v) => ({
                  value: v,
                  label: v,
                }))}
                placeholder="Select status"
              />
            </div>
            <div>
              <Label>Scheduled At</Label>
              <Input
                type="datetime-local"
                value={form.head_scheduled_at}
                onChange={(e) => set("head_scheduled_at", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.head_notes}
                onChange={(e) => set("head_notes", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Final Interview (PSB)">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select
                value={form.final_status}
                onChange={(v) => set("final_status", v)}
                options={INTERVIEW_STAGE_STATUS_OPTIONS.map((v) => ({
                  value: v,
                  label: v,
                }))}
                placeholder="Select status"
              />
            </div>
            <div>
              <Label>Scheduled At</Label>
              <Input
                type="datetime-local"
                value={form.final_scheduled_at}
                onChange={(e) => set("final_scheduled_at", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.final_notes}
                onChange={(e) => set("final_notes", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Overall Result">
          <Label required>Overall Status</Label>
          <Select
            value={form.overall_status}
            onChange={(v) => set("overall_status", v)}
            options={INTERVIEW_OVERALL_STATUS_OPTIONS.map((v) => ({
              value: v,
              label: v,
            }))}
            placeholder="Select overall status"
          />
          <p className="mt-1.5 text-[11px] text-slate-400">
            Dapat maging{" "}
            <span className="font-medium text-slate-600">Completed</span> ito
            bago maaprubahan ang application na ito.
          </p>
        </FormSection>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button
          variant="secondary"
          onClick={() => !saving && onClose()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Interview"
          )}
        </Button>
      </div>
    </Modal>
  );
}
