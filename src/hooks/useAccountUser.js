import { useContext, useMemo } from "react";
import { AuthContext } from "@/context/authContext";

export function useAccountUser() {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    if (!user) return null;

    const employee = user.employee ?? {};
    const firstName = employee.first_name ?? user.first_name ?? "";
    const middleName = employee.middle_name ?? user.middle_name ?? "";
    const lastName = employee.last_name ?? user.last_name ?? "";
    const nameParts = [firstName, middleName, lastName].filter(Boolean);
    const fullName =
      nameParts.length > 0
        ? nameParts.join(" ")
        : (user.name ?? "Unknown User");

    const department =
      employee.department?.name ??
      employee.department_name ??
      user.department ??
      "—";

    const role =
      user.roles?.[0] ??
      employee.position?.title ??
      employee.designation ??
      "—";

    return {
      id: user.id,
      fullName: fullName,
      employeeId:
        employee.employee_id ?? employee.employee_number ?? employee.id ?? null,
      email: user.email ?? "—",
      department,
      role,
      contactNumber:
        employee.contact_number ??
        employee.phone ??
        employee.mobile_number ??
        user.phone ??
        "",
      avatarUrl: user.avatar_url ?? employee.avatar_url ?? null,
    };
  }, [user]);
}
