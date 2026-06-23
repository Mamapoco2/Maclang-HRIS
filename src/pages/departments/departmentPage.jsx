import { useState, useEffect, useMemo, useCallback } from "react";
import { departmentService } from "../../services/departmentServices";
import { divisionService } from "../../services/divisionService";
import { toast } from "sonner";
import api from "@/api/api";
import { Plus, Search } from "lucide-react";
import DepartmentTiles from "./components/DepartmentTiles";
import AddDepartmentModal from "./components/addDepartmentModal";
import EditDepartmentModal from "./components/Editdepartmentmodal";
import DeleteDepartmentDialog from "./components/DeleteDepartmentDialog";
import EditDivisionModal from "./components/EditDivisionModal";
import DeleteDivisionDialog from "./components/DeleteDivisionDialog";
import AddMCCOfficeModal from "./components/AddMCCOfficeModal";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived from divisions — drives the button label
  const [hasOffice, setHasOffice] = useState(false);

  // ── Department modals ────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [showAddMCC, setShowAddMCC] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Division modals ──────────────────────────────────────────────────────
  const [editDivisionTarget, setEditDivisionTarget] = useState(null);
  const [deleteDivisionTarget, setDeleteDivisionTarget] = useState(null);
  const [deletingDivision, setDeletingDivision] = useState(false);

  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [deptData, divData] = await Promise.all([
        departmentService.getDepartments(),
        divisionService.getAll(),
      ]);

      const depts = Array.isArray(deptData) ? deptData : (deptData?.data ?? []);
      const divs = Array.isArray(divData) ? divData : [];

      setDepartments(depts);
      setDivisions(divs);

      // Sync the button label with the actual data
      setHasOffice(divs.some((d) => d.type?.toUpperCase() === "OFFICE"));
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q) ||
        d.division?.name?.toLowerCase().includes(q) ||
        d.type?.toLowerCase().includes(q),
    );
  }, [departments, search]);

  // ── Department handlers ──────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      toast.error("Failed to delete department.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Division handlers ────────────────────────────────────────────────────

  const handleDeleteDivisionConfirm = async () => {
    if (!deleteDivisionTarget) return;
    setDeletingDivision(true);
    try {
      await api.delete(`/divisions/${deleteDivisionTarget.id}`);
      toast.success(`"${deleteDivisionTarget.name}" deleted.`);
      setDepartments((prev) =>
        prev.map((d) =>
          d.division?.id === deleteDivisionTarget.id
            ? { ...d, division: null, division_id: null }
            : d,
        ),
      );
      setDivisions((prev) =>
        prev.filter((d) => d.id !== deleteDivisionTarget.id),
      );
    } catch {
      toast.error("Failed to delete division.");
    } finally {
      setDeletingDivision(false);
      setDeleteDivisionTarget(null);
    }
  };

  // Button label reflects whether an OFFICE already exists
  const addDivisionButtonLabel = hasOffice
    ? "Add Directorate / Division"
    : "Add Office / Division";

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-background p-4">
      <div className="p-2 w-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Departments
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading..."
                : search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${departments.length} total`}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments..."
                className="w-full rounded-lg border border-border bg-background pl-9 pr-8 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Label updates based on whether an OFFICE already exists */}
            <button
              onClick={() => setShowAddMCC(true)}
              className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-100 active:scale-95 whitespace-nowrap"
            >
              <Plus size={15} />
              {addDivisionButtonLabel}
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95 whitespace-nowrap"
            >
              <Plus size={15} />
              Add Department
            </button>
          </div>
        </div>

        <DepartmentTiles
          departments={filtered}
          divisions={divisions}
          loading={loading}
          search={search}
          onEdit={setEditTarget}
          onDelete={(dept) => setDeleteTarget({ id: dept.id, name: dept.name })}
          onEditDivision={setEditDivisionTarget}
          onDeleteDivision={(div) =>
            setDeleteDivisionTarget({ id: div.id, name: div.name })
          }
          onClearSearch={() => setSearch("")}
        />
      </div>

      <AddDepartmentModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          setShowAdd(false);
          fetchAll();
        }}
      />
      <EditDepartmentModal
        open={!!editTarget}
        department={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setEditTarget(null);
          fetchAll();
        }}
      />
      <DeleteDepartmentDialog
        target={deleteTarget}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <EditDivisionModal
        open={!!editDivisionTarget}
        division={editDivisionTarget}
        onClose={() => setEditDivisionTarget(null)}
        onSuccess={() => {
          setEditDivisionTarget(null);
          fetchAll();
        }}
      />
      <DeleteDivisionDialog
        target={deleteDivisionTarget}
        deleting={deletingDivision}
        onConfirm={handleDeleteDivisionConfirm}
        onCancel={() => setDeleteDivisionTarget(null)}
      />

      <AddMCCOfficeModal
        open={showAddMCC}
        onClose={() => setShowAddMCC(false)}
        onSuccess={() => {
          setShowAddMCC(false);
          fetchAll();
        }}
      />
    </div>
  );
}
