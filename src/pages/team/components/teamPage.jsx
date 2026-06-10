import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { toast } from "sonner";
import { employeeService } from "../../../services/employeeService";
import { AuthContext } from "@/context/authContext";
import { getEcho } from "../../../lib/echo";
import TeamTableHeader from "./TeamTableHeader";
import DepartmentTeamCard from "./departmentTeamCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TeamSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          {/* Card header */}
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <div className="w-3.5 h-3.5 bg-gray-200 rounded" />
            <div className="h-3.5 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded ml-1" />
          </div>
          {/* Rows */}
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
              <div className="w-7 h-7 bg-gray-100 rounded-full shrink-0" />
              <div className="h-3 flex-1 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-5 w-14 bg-gray-100 rounded-full" />
              <div className="h-6 w-12 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  // Realtime: listen for employee updates
  useEffect(() => {
    const echo = getEcho();
    const channel = echo.channel("employees");

    const onEmployeeUpdated = (e) => {
      if (!e.employee) return;
      setMembers((prev) => {
        const exists = prev.some((m) => m.id === e.employee.id);
        if (exists) return prev.map((m) => m.id === e.employee.id ? { ...m, ...e.employee } : m);
        return [e.employee, ...prev];
      });
    };

    channel.listen(".employee.updated", onEmployeeUpdated);
    return () => channel.stopListening(".employee.updated", onEmployeeUpdated);
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
          ? member.departments.filter((d) => userDepartmentIds.includes(String(d.id)))
          : [{ id: "none", name: "No Department" }];

      depts.forEach((dept) => {
        if (!map.has(dept.id)) map.set(dept.id, { name: dept.name, members: [] });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen mx-auto px-6 py-4">
          <TeamTableHeader
            totalGroups={groupedByDepartment.length}
            departmentName={primaryDepartmentName}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen mx-auto px-4 sm:px-6 py-6 space-y-4">
        {loading && <TeamSkeleton />}

        {!loading && groupedByDepartment.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="text-center py-16 text-gray-400 text-sm">
              {userDepartmentIds.length === 0
                ? "No department assigned to your account."
                : "No team members found."}
            </div>
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
