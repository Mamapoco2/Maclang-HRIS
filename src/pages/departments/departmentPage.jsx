import { useState, useEffect, useMemo, useCallback } from "react";
import { departmentService } from "../../services/departmentServices";
import { toast } from "sonner";
import api from "@/api/api";
import { Plus, Search } from "lucide-react";
import DepartmentTiles from "./components/DepartmentTiles";
import AddDepartmentModal from "./components/addDepartmentModal";
import EditDepartmentModal from "./components/Editdepartmentmodal";
import DeleteDepartmentDialog from "./components/DeleteDepartmentDialog";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 16;

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(Array.isArray(data) ? data : (data?.data ?? []));
      setPage(1);
    } catch {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);
  useEffect(() => {
    setPage(1);
  }, [search]);

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setPage(1);
    } catch {
      toast.error("Failed to delete department.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-screen-2xl py-6 space-y-5">
        {/* Header */}
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
            {/* Search */}
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
          loading={loading}
          search={search}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onEdit={setEditTarget}
          onDelete={(dept) => setDeleteTarget({ id: dept.id, name: dept.name })}
          onClearSearch={() => setSearch("")}
        />
      </div>

      <AddDepartmentModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          setShowAdd(false);
          fetchDepartments();
        }}
      />

      <EditDepartmentModal
        open={!!editTarget}
        department={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setEditTarget(null);
          fetchDepartments();
        }}
      />

      <DeleteDepartmentDialog
        target={deleteTarget}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
