import React from "react";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

const formatRole = (role) =>
  (Array.isArray(role) ? role : [role].filter(Boolean))
    .filter(Boolean)
    .join(", ")
    .toUpperCase() || "-";

const getDeptNames = (emp) => {
  if (Array.isArray(emp.departments) && emp.departments.length > 0)
    return emp.departments.map((d) => d.name).filter(Boolean);
  if (emp.department?.name) return [emp.department.name];
  if (Array.isArray(emp.department_ids) && emp.department_ids.length > 0)
    return emp.department_ids.map((id) => `Dept #${id}`);
  return [];
};

const getStatusFromInfo = (emp) => {
  const manual = emp.employment_status?.toUpperCase();

  if (manual === "RESIGN") return "Resign";
  if (manual === "INACTIVE") return "Inactive";
  if (manual === "ACTIVE") return "Active";

  const infoStatus = emp.info?.status;
  if (!infoStatus || infoStatus === "EMPTY") return "Inactive";
  return "Active";
};

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700 ring-1 ring-green-200",
  Inactive: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  Resign: "bg-red-100 text-red-700 ring-1 ring-red-200",
};

export default function EmployeeTable({
  employees = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
}) {
  const rows = Array.isArray(employees) ? employees : [];

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:8000"}/storage/${url}`;
  };

  return (
    <div className="rounded-lg border bg-card w-full">
      <table className="w-full text-sm">
        <colgroup>
          <col className="w-14" />
          <col className="w-32" />
          <col className="w-32" />
          <col className="w-32" />
          <col className="w-40" />
          <col className="w-48" />
          <col className="w-64" />
          <col className="w-24" />
          <col className="w-52" />
        </colgroup>

        <thead>
          <tr className="border-b uppercase text-xs text-muted-foreground">
            <th className="py-3 px-4"></th>
            <th className="py-3 px-4 text-center font-medium">First Name</th>
            <th className="py-3 px-4 text-center font-medium">Last Name</th>
            <th className="py-3 px-4 text-center font-medium">Middle Name</th>
            <th className="py-3 px-4 text-center font-medium">
              Position Classification
            </th>
            <th className="py-3 px-4 text-center font-medium">Division</th>
            <th className="py-3 px-4 text-center font-medium">Department</th>
            <th className="py-3 px-4 text-center font-medium">Status</th>
            <th className="py-3 px-4 text-center font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={9}
                className="text-center py-8 text-muted-foreground"
              >
                LOADING...
              </td>
            </tr>
          ) : rows.length > 0 ? (
            rows.map((emp) => {
              const deptNames = getDeptNames(emp);
              const status = getStatusFromInfo(emp);
              const avatarSrc = getAvatarUrl(emp.avatar_url);

              return (
                <tr
                  key={emp.id}
                  className="border-b uppercase hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 bg-gray-200 flex items-center justify-center">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          className="w-full h-full object-cover"
                          alt="avatar"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.querySelector(
                              ".fallback-initials",
                            ).style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="fallback-initials text-gray-600 text-sm font-bold items-center justify-center w-full h-full"
                        style={{ display: avatarSrc ? "none" : "flex" }}
                      >
                        {emp.first_name?.[0]}
                        {emp.last_name?.[0]}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center truncate max-w-0">
                    <span className="block truncate">
                      {emp.first_name?.toUpperCase() || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center truncate max-w-0">
                    <span className="block truncate">
                      {emp.last_name?.toUpperCase() || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center max-w-0">
                    <span className="block truncate">
                      {emp.middle_name?.toUpperCase() || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center max-w-0">
                    <span className="block truncate">
                      {formatRole(emp.role_position)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="block whitespace-normal break-words">
                      {emp.division?.name?.toUpperCase() || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="block whitespace-normal break-words">
                      {deptNames.length > 0
                        ? deptNames.map((n) => n.toUpperCase()).join(", ")
                        : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
                    >
                      {status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 bg-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 hover:text-white h-7 px-2 text-xs"
                        onClick={() => onView(emp)}
                      >
                        <IconEye size={13} className="mr-1" /> VIEW
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-amber-500 border-amber-500 text-white hover:bg-amber-600 hover:border-amber-600 hover:text-white h-7 px-2 text-xs"
                        onClick={() => onEdit(emp)}
                      >
                        <IconEdit size={13} className="mr-1" /> EDIT
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 hover:text-white h-7 px-2 text-xs"
                        onClick={() => onDelete(emp.id)}
                      >
                        <IconTrash size={13} className="mr-1" /> DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={9}
                className="text-center py-8 text-muted-foreground"
              >
                NO EMPLOYEES FOUND
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
