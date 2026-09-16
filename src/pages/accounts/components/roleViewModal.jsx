import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Users } from "lucide-react";
import { PERMISSION_GROUPS } from "./permissionGroups";
import { DEFAULT_ROLE_NAME, ACCESS_SCOPE_LABEL } from "../roles";

export default function RoleViewModal({ open, onClose, role }) {
  if (!role) return null;

  const grantedByGroup = PERMISSION_GROUPS.map(({ group, permissions }) => ({
    group,
    labels: permissions
      .filter((p) => role.permissions?.includes(p.key))
      .map((p) => p.label),
  })).filter((g) => g.labels.length > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-gray-100 p-0 shadow-xl">
        <DialogHeader className="px-6 pb-0 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Eye size={16} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-gray-900">
                {role.name}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-400">
                {role.description || "No description provided."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              {role.accessScope
                ? ACCESS_SCOPE_LABEL[role.accessScope]
                : "Scope not set"}
            </span>
            {role.departments?.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700"
              >
                {d.name}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
              <Users size={11} />
              {role.usersCount ?? 0} user{role.usersCount === 1 ? "" : "s"}{" "}
              assigned
            </span>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Permissions
          </p>

          {grantedByGroup.length === 0 ? (
            <p className="py-8 text-center text-xs italic text-gray-400">
              No permissions granted to this role.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-400">
                      Module
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-400">
                      Permissions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grantedByGroup.map(({ group, labels }) => (
                    <tr key={group}>
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">
                        {group}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {labels.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
