import { useState, useEffect } from "react";
import { X, Building } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api/api";

const TYPE_OPTIONS = [
  { value: "OFFICE", label: "OFFICE" },
  { value: "DIRECTORATE", label: "DIRECTORATE" },
  { value: "DIVISION", label: "DIVISION" },
];

const DEFAULT_NAMES = {
  OFFICE: "MEDICAL CENTER CHIEF",
  DIRECTORATE: "",
  DIVISION: "",
};

export default function AddMCCOfficeModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasOffice, setHasOffice] = useState(false);
  const [checkingOffice, setCheckingOffice] = useState(false);

  useEffect(() => {
    if (!open) return;

    setCheckingOffice(true);
    api
      .get("/divisions")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        const officeExists = list.some(
          (d) => d.type?.toUpperCase() === "OFFICE",
        );
        setHasOffice(officeExists);

        if (officeExists) {
          setForm({ code: "", name: "", description: "", type: "" });
        } else {
          setForm({
            code: "",
            name: "",
            description: "",
            type: "",
          });
        }
      })
      .catch(() => toast.error("FAILED TO CHECK EXISTING DIVISIONS."))
      .finally(() => setCheckingOffice(false));
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value.toUpperCase(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.type) {
      toast.error("TYPE IS REQUIRED.");
      return;
    }

    if (!form.code.trim() || !form.name.trim()) {
      toast.error("CODE AND NAME ARE REQUIRED.");
      return;
    }

    if (form.type === "OFFICE" && hasOffice) {
      toast.error("AN OFFICE ALREADY EXISTS. ONLY ONE OFFICE IS ALLOWED.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/divisions", {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        parent_id: null,
        type: form.type,
      });
      toast.success(`"${form.name}" CREATED AS ${form.type}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "FAILED TO CREATE RECORD.";
      toast.error(msg.toUpperCase());
    } finally {
      setSubmitting(false);
    }
  };

  const availableTypes = TYPE_OPTIONS.map((opt) => ({
    ...opt,
    disabled: opt.value === "OFFICE" && hasOffice,
  }));

  // Dynamic header label based on selected type
  const headerLabel = form.type
    ? `ADD ${form.type}`
    : "ADD OFFICE / DIRECTORATE / DIVISION";

  // Dynamic description based on selected type
  const typeDescriptions = {
    OFFICE:
      "OFFICE IS THE ROOT OF THE ORGANIZATION AND CAN ONLY BE CREATED ONCE.",
    DIRECTORATE:
      "A DIRECTORATE SITS DIRECTLY UNDER THE OFFICE AND OVERSEES MULTIPLE DIVISIONS.",
    DIVISION:
      "A DIVISION IS A FUNCTIONAL UNIT THAT BELONGS UNDER AN OFFICE OR DIRECTORATE.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Header — updates with selected type */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Building size={18} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 uppercase">
              {headerLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Office already exists banner */}
        {hasOffice && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-700 uppercase font-medium">
              AN OFFICE ALREADY EXISTS. YOU MAY ONLY ADD A DIRECTORATE OR
              DIVISION.
            </p>
          </div>
        )}

        {/* Dynamic description — updates with selected type */}
        {form.type && (
          <p className="text-xs text-gray-500 mb-4 uppercase">
            {typeDescriptions[form.type]}
          </p>
        )}

        {checkingOffice ? (
          <div className="py-8 text-center text-xs text-slate-400 uppercase">
            CHECKING EXISTING RECORDS...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                TYPE <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value,
                    name: DEFAULT_NAMES[value] ?? "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="SELECT TYPE" />
                </SelectTrigger>

                <SelectContent>
                  {availableTypes.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                CODE <span className="text-red-500">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder={
                  form.type === "OFFICE"
                    ? "E.G. MCC"
                    : form.type === "DIRECTORATE"
                      ? "E.G. DIR"
                      : "E.G. HAD"
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                NAME <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={
                  form.type === "OFFICE"
                    ? "E.G. MEDICAL CENTER CHIEF"
                    : form.type === "DIRECTORATE"
                      ? "E.G. MEDICAL DIRECTORATE"
                      : "E.G. HOSPITAL ADMINISTRATION DIVISION"
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                DESCRIPTION
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="OPTIONAL DESCRIPTION..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 uppercase"
              >
                {submitting ? "CREATING..." : `CREATE ${form.type || "RECORD"}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
