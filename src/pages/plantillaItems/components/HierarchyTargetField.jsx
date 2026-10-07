import { useState } from "react";
import { Search, X, Lock } from "lucide-react";
import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TYPE_BADGE } from "../helpers/constants";
import { departmentsUnderUnit } from "../helpers/plantillaHelpers";
import { getAllUnits } from "../helpers/departmentStore";

const OFFICE_TYPE_LABELS = {
  DEPARTMENT: "Department",
  SECTION: "Section",
  UNIT: "Unit",
  CLUSTER: "Cluster",
};

function officeTypeLabel(type) {
  return OFFICE_TYPE_LABELS[(type ?? "").toUpperCase()] ?? "Department";
}

function TypeBadge({ type, small }) {
  const t = (type ?? "").toUpperCase();
  return (
    <span
      className={`font-semibold rounded shrink-0 ${
        small ? "text-[9px] px-1 py-0.5 mt-0.5" : "text-[10px] px-1.5 py-0.5"
      } ${TYPE_BADGE[t] ?? "bg-gray-100 text-gray-600"}`}
    >
      {t}
    </span>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <div className="px-2 py-1.5 bg-white border-b border-gray-100">
      <div className="relative">
        <Search
          size={11}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          placeholder="Search…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-emerald-400"
        />
      </div>
    </div>
  );
}

/**
 * Directorate/Division → Department/Section/Unit picker.
 *
 * `units` is the list of ACTIVE units from the Plantilla Positions Department
 * Database (see helpers/departmentStore.js). Options are controlled by it —
 * nothing is typed in by hand — and the second dropdown only offers units that
 * belong to the selected Directorate/Division.
 *
 * Value format is unchanged: "" | "division:<id>" | "department:<id>".
 * A division must be chosen first; the department is optional (leave it blank
 * to attach directly to the Directorate/Division).
 */
export function HierarchyTargetField({ units, loading, value, onChange }) {
  const [unitSearch, setUnitSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  // Dropdown options: Active units only.
  const unitOptions = units.filter((u) => u.kind === "division");
  const departmentOptions = units.filter((u) => u.kind === "department");

  // Selected values are resolved against the full database so a record that
  // points at a since-deactivated unit still displays correctly.
  const everything = getAllUnits();

  const parsed = (() => {
    const [type, id] = (value || "").split(":");
    return { type: type || null, id: id ? Number(id) : null };
  })();

  const selectedDept =
    parsed.type === "department"
      ? everything.find((u) => u.kind === "department" && u.id === parsed.id)
      : null;
  const selectedUnit = selectedDept
    ? everything.find(
        (u) => u.kind === "division" && u.id === Number(selectedDept.division_id),
      )
    : parsed.type === "division"
      ? everything.find((u) => u.kind === "division" && u.id === parsed.id)
      : null;

  const filteredUnitOptions = unitOptions.filter((u) =>
    u.name.toLowerCase().includes(unitSearch.toLowerCase()),
  );
  const filteredDepartmentOptions = departmentsUnderUnit(
    departmentOptions,
    selectedUnit,
  ).filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase()));

  const handleClearAll = () => {
    onChange("");
    setUnitSearch("");
    setDeptSearch("");
  };

  // Clearing the department keeps the Directorate/Division selected.
  const handleClearDept = () => {
    onChange(selectedUnit ? `division:${selectedUnit.id}` : "");
    setDeptSearch("");
  };

  return (
    <div className="space-y-3">
      {/* Tier 1: Directorate / Division */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Directorate / Division
        </p>
        {selectedUnit ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
            <TypeBadge type={selectedUnit.type} />
            <span className="text-sm font-medium flex-1 truncate">
              {selectedUnit.name}
            </span>
            {selectedUnit.status === "INACTIVE" && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 rounded px-1.5 py-0.5 shrink-0">
                INACTIVE
              </span>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              title="Change Directorate / Division"
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <Select
            onValueChange={(v) => {
              setDeptSearch("");
              onChange(`division:${v}`);
            }}
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
            <SelectContent className="p-0 overflow-hidden w-80">
              <SearchBox value={unitSearch} onChange={setUnitSearch} />
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
                      key={`division-${u.id}`}
                      value={String(u.id)}
                      className="pl-3 [&>span:first-child]:hidden"
                    >
                      <span className="flex items-start gap-1.5">
                        <TypeBadge type={u.type} small />
                        <span className="whitespace-normal leading-snug">{u.name}</span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tier 2: Department / Section / Unit — only units under the division */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {selectedDept
            ? officeTypeLabel(selectedDept.type)
            : "Department / Section / Unit"}{" "}
          <span className="text-gray-300 normal-case font-normal">
            (optional — leave blank to attach directly to the Directorate /
            Division above)
          </span>
        </p>
        {selectedDept ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
            <TypeBadge type={selectedDept.type ?? "DEPARTMENT"} />
            <span className="text-sm font-medium flex-1 truncate">
              {selectedDept.name}
            </span>
            {selectedDept.status === "INACTIVE" && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 rounded px-1.5 py-0.5 shrink-0">
                INACTIVE
              </span>
            )}
            <button
              type="button"
              onClick={handleClearDept}
              title="Clear department"
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : !selectedUnit ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-200 bg-slate-50/60 text-sm text-slate-400 cursor-not-allowed select-none">
            <Lock size={12} className="shrink-0" />
            Select a Directorate / Division first
          </div>
        ) : (
          <Select
            onValueChange={(v) => onChange(`department:${v}`)}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger className="text-sm border-gray-200">
                <SelectValue placeholder="Select department/section/unit (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="p-0 overflow-hidden w-80">
              <SearchBox value={deptSearch} onChange={setDeptSearch} />
              <div className="px-3 py-1.5 text-[10px] text-slate-400 bg-slate-50 border-b border-gray-100 truncate">
                Under {selectedUnit.name}
              </div>
              <div className="overflow-y-auto max-h-44">
                {loading ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    Loading...
                  </div>
                ) : filteredDepartmentOptions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    No active units under this Directorate / Division.
                  </div>
                ) : (
                  filteredDepartmentOptions.map((d) => (
                    <SelectItem
                      key={`department-${d.id}`}
                      value={String(d.id)}
                      className="pl-3 [&>span:first-child]:hidden"
                    >
                      <span className="flex items-start gap-1.5">
                        <TypeBadge type={d.type} small />
                        <span className="whitespace-normal leading-snug">{d.name}</span>
                      </span>
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
