import { useState } from "react";
import { Search, X } from "lucide-react";
import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TYPE_BADGE } from "../helpers/constants";
import {
  resolveUnitForDepartment,
  departmentsUnderUnit,
} from "../helpers/plantillaHelpers";

/**
 * Two-tier org-placement picker: pick a Directorate/Division directly, OR
 * pick a Department (which auto-resolves and locks its parent
 * Directorate/Division). Used by both the "Add Plantilla Item" and
 * "Edit Slot" forms via the shared `display_target` field
 * ("division:<id>" | "department:<id>").
 */
export function HierarchyTargetField({ units, loading, value, onChange }) {
  const [unitSearch, setUnitSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  const unitOptions = units.filter((u) =>
    ["DIRECTORATE", "OFFICE", "DIVISION"].includes(
      (u.type ?? "").toUpperCase(),
    ),
  );
  const departmentOptions = units.filter(
    (u) => (u.type ?? "").toUpperCase() === "DEPARTMENT",
  );

  const parsed = (() => {
    const [type, id] = (value || "").split(":");
    return { type: type || null, id: id ? Number(id) : null };
  })();

  const selectedDept =
    parsed.type === "department"
      ? departmentOptions.find((d) => d.id === parsed.id)
      : null;
  const directlySelectedUnit =
    parsed.type === "division"
      ? unitOptions.find((u) => u.id === parsed.id)
      : null;

  const resolvedUnit = selectedDept
    ? resolveUnitForDepartment(selectedDept)
    : directlySelectedUnit;

  const filteredUnitOptions = unitOptions.filter((u) =>
    u.name.toLowerCase().includes(unitSearch.toLowerCase()),
  );
  const filteredDepartmentOptions = departmentsUnderUnit(
    departmentOptions,
    resolvedUnit,
  ).filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase()));

  const handlePickUnit = (unit) => {
    if (!unit) return;
    onChange(`division:${unit.id}`);
  };

  const handlePickDepartment = (dept) => {
    if (!dept) return;
    onChange(`department:${dept.id}`);
  };

  const handleClear = () => {
    onChange("");
    setUnitSearch("");
    setDeptSearch("");
  };

  return (
    <div className="space-y-3">
      {/* Tier 1: Directorate / Division */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Directorate / Division
        </p>
        {resolvedUnit ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                TYPE_BADGE[(resolvedUnit.type ?? "").toUpperCase()] ??
                "bg-gray-100 text-gray-600"
              }`}
            >
              {(resolvedUnit.type ?? "").toUpperCase()}
            </span>
            <span className="text-sm font-medium flex-1 truncate">
              {resolvedUnit.name}
            </span>
            {selectedDept ? (
              <span className="text-[10px] text-gray-400 normal-case shrink-0">
                auto (from Department)
              </span>
            ) : (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <Select
            onValueChange={(v) =>
              handlePickUnit(unitOptions.find((u) => String(u.id) === v))
            }
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger className="text-sm border-gray-200">
                <SelectValue
                  placeholder={
                    loading ? "Loading..." : "Select directorate or division"
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="p-0 overflow-hidden w-72">
              <div className="px-2 py-1.5 bg-white border-b border-gray-100">
                <div className="relative">
                  <Search
                    size={11}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    placeholder="Search…"
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-44">
                {loading ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    Loading...
                  </div>
                ) : filteredUnitOptions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    No results found.
                  </div>
                ) : (
                  filteredUnitOptions.map((u) => (
                    <SelectItem
                      key={`${u.type}-${u.id}`}
                      value={String(u.id)}
                      className="pl-3 [&>span:first-child]:hidden"
                    >
                      <span
                        className={`text-[9px] font-semibold px-1 py-0.5 rounded mr-1.5 ${
                          TYPE_BADGE[(u.type ?? "").toUpperCase()] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {(u.type ?? "").toUpperCase()}
                      </span>
                      {u.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tier 2: Department (optional) */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Department{" "}
          <span className="text-gray-300 normal-case font-normal">
            (optional — leave blank to attach directly to the
            Directorate/Division above)
          </span>
        </p>
        {selectedDept ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 bg-blue-100 text-blue-700">
              DEPT
            </span>
            <span className="text-sm font-medium flex-1 truncate">
              {selectedDept.name}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <Select
            onValueChange={(v) =>
              handlePickDepartment(
                departmentOptions.find((d) => String(d.id) === v),
              )
            }
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger className="text-sm border-gray-200">
                <SelectValue
                  placeholder={
                    loading
                      ? "Loading..."
                      : resolvedUnit
                        ? "Select department (optional)"
                        : "Select department"
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="p-0 overflow-hidden w-72">
              <div className="px-2 py-1.5 bg-white border-b border-gray-100">
                <div className="relative">
                  <Search
                    size={11}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    placeholder="Search…"
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-44">
                {loading ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    Loading...
                  </div>
                ) : filteredDepartmentOptions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    {resolvedUnit
                      ? "No departments under this unit."
                      : "No departments found."}
                  </div>
                ) : (
                  filteredDepartmentOptions.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={String(d.id)}
                      className="pl-3 [&>span:first-child]:hidden"
                    >
                      {d.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
