import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EditMemberModal({ member, open, onOpenChange, onUpdate }) {
  const [form, setForm] = useState({
    firstName: member.first_name ?? "",
    lastName: member.last_name ?? "",
    role: Array.isArray(member.role_position)
      ? member.role_position.join(", ")
      : (member.role_position ?? ""),
    email: member.email ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(member.id, form);
    onOpenChange(false);
  };

  const fields = [
    { key: "firstName", label: "First Name", type: "text" },
    { key: "lastName", label: "Last Name", type: "text" },
    { key: "role", label: "Role / Position", type: "text" },
    { key: "email", label: "Email", type: "email" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Edit Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, type }) => (
              <div
                key={key}
                className={`space-y-1.5 ${key === "email" ? "col-span-2" : ""}`}
              >
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
