import { useState } from "react";
import { X, Building } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

export default function AddMCCOfficeModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: "",
    name: "Medical Center Chief",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Code and name are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/divisions", {
        ...form,
        parent_id: null, // Office is the root of the org
        type: "OFFICE",
      });
      toast.success(`"${form.name}" created as the Office.`);
      setForm({ code: "", name: "Medical Center Chief", description: "" });
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to create office.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Building size={18} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Add Office</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          This creates the top-level <strong>Office</strong> (e.g. Medical
          Center Chief) — the root of the organization. Divisions and
          Directorates can then be linked under it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. MCC"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Medical Center Chief"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Office"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
