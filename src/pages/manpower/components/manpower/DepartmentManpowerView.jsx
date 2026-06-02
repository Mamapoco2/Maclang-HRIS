// src/pages/manpower/components/manpower/DepartmentManpowerView.jsx
import { useState, useEffect } from "react";
import { manpowerService } from "@/services/manpowerService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DepartmentCard from "./DepartmentCard";

const DIVISION_COLORS = {
  1: { bg: "bg-blue-50", border: "border-blue-300" },
  2: { bg: "bg-violet-50", border: "border-violet-300" },
  3: { bg: "bg-emerald-50", border: "border-emerald-300" },
  4: { bg: "bg-amber-50", border: "border-amber-300" },
  5: { bg: "bg-rose-50", border: "border-rose-300" },
};

export default function DepartmentManpowerView() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDivisions, setSelectedDivisions] = useState(new Set());

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await manpowerService.getDepartments();
      setDivisions(data);
    } catch (err) {
      console.error("Failed to load manpower data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDivision = (divisionId) => {
    const newSelected = new Set(selectedDivisions);
    if (newSelected.has(divisionId)) {
      newSelected.delete(divisionId);
    } else {
      newSelected.add(divisionId);
    }
    setSelectedDivisions(newSelected);
  };

  const visibleDivisions =
    selectedDivisions.size === 0
      ? divisions
      : divisions.filter((div) => selectedDivisions.has(div.id));

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading manpower data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Division Filter */}
      {divisions.length > 1 && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border">
          <span className="text-xs font-semibold text-gray-600 uppercase self-center mr-4">
            Filter by Division:
          </span>
          {divisions.map((div) => (
            <Button
              key={div.id}
              onClick={() => toggleDivision(div.id)}
              variant={selectedDivisions.has(div.id) ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {div.name}
            </Button>
          ))}
        </div>
      )}

      {/* Divisions & Departments */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      ) : visibleDivisions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No divisions to display</p>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleDivisions.map((division) => (
            <div key={division.id} className="space-y-4">
              {/* Division Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                  {division.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {division.departments.length} department
                  {division.departments.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Departments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {division.departments.map((dept) => {
                  const colors =
                    DIVISION_COLORS[division.id] || DIVISION_COLORS[1];
                  return (
                    <DepartmentCard
                      key={dept.id}
                      department={dept}
                      borderColor={colors.border}
                      bgColor={colors.bg}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
