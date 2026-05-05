import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { employeeService } from "../../../services/employeeService";
import { AuthContext } from "@/context/authContext";
import { getEcho } from "../../../lib/echo";
import TeamTableHeader from "./TeamTableHeader";
import DepartmentTeamCard from "./departmentTeamCard";

export default function TeamTable() {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAllEmployees();
      setMembers(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch {
      toast.error("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ✅ Realtime: listen for employee updates and activations
  useEffect(() => {
    const echo = getEcho();
    const channel = echo.channel("employees");

    // Fired when an employee's department/details change
    const onEmployeeUpdated = (e) => {
      if (!e.employee) return;
      setMembers((prev) => {
        const exists = prev.some((m) => m.id === e.employee.id);
        if (exists) {
          return prev.map((m) =>
            m.id === e.employee.id ? { ...m, ...e.employee } : m,
          );
        }
        // New employee assigned to a dept — add to list
        return [e.employee, ...prev];
      });
    };

    channel.listen(".employee.updated", onEmployeeUpdated);

    return () => {
      channel.stopListening(".employee.updated", onEmployeeUpdated);
    };
  }, []);

  const userDepartmentIds = useMemo(() => {
    if (!user?.department_ids) return [];
    return user.department_ids.map((id) => String(id));
  }, [user]);

  const primaryDepartmentName = useMemo(() => {
    if (!user?.departments?.length) return "";
    return user.departments[0]?.name ?? "";
  }, [user]);

  const myDepartmentMembers = useMemo(() => {
    if (userDepartmentIds.length === 0) return [];
    return members.filter((member) => {
      const memberDeptIds = Array.isArray(member.departments)
        ? member.departments.map((d) => String(d.id))
        : [];
      return memberDeptIds.some((id) => userDepartmentIds.includes(id));
    });
  }, [members, userDepartmentIds]);

  const groupedByDepartment = useMemo(() => {
    const map = new Map();

    myDepartmentMembers.forEach((member) => {
      const depts =
        Array.isArray(member.departments) && member.departments.length > 0
          ? member.departments.filter((d) =>
              userDepartmentIds.includes(String(d.id)),
            )
          : [{ id: "none", name: "No Department" }];

      depts.forEach((dept) => {
        if (!map.has(dept.id)) {
          map.set(dept.id, { name: dept.name, members: [] });
        }
        map.get(dept.id).members.push(member);
      });
    });

    return Array.from(map.entries())
      .sort(([aId, a], [bId, b]) => {
        if (aId === "none") return 1;
        if (bId === "none") return -1;
        return a.name.localeCompare(b.name);
      })
      .map(([id, group]) => ({ id, ...group }));
  }, [myDepartmentMembers, userDepartmentIds]);

  return (
    <div className="w-full py-6 px-4">
      <div className="max-w-full mx-auto space-y-4">
        <TeamTableHeader
          totalGroups={groupedByDepartment.length}
          departmentName={primaryDepartmentName}
        />

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-40 rounded" />
                <div className="rounded-xl border overflow-hidden">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex gap-3 px-4 py-2.5 border-b">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      {Array.from({ length: 4 }).map((_, k) => (
                        <Skeleton key={k} className="h-3.5 flex-1 rounded" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && groupedByDepartment.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {userDepartmentIds.length === 0
              ? "No department assigned to your account."
              : "No team members found."}
          </div>
        )}

        {!loading &&
          groupedByDepartment.map((group) => (
            <DepartmentTeamCard key={group.id} group={group} />
          ))}
      </div>
    </div>
  );
}
