import { useState } from "react";
import { Search } from "lucide-react";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { DEPT_TYPES } from "../helpers/constants";

export function DeptSelectContent({ departments, loading, search, onSearch }) {
  const [activeTab, setActiveTab] = useState(DEPT_TYPES[0]);

  const filtered = departments.filter(
    (d) =>
      (d.type ?? "").toUpperCase() === activeTab &&
      d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SelectContent className="p-0 overflow-hidden w-72">
      <div className="flex border-b border-gray-100 bg-gray-50">
        {DEPT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setActiveTab(type);
            }}
            className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === type
                ? "bg-white text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {type === "DIRECTORATE"
              ? "DIR."
              : type === "DEPARTMENT"
                ? "DEPT"
                : type}
          </button>
        ))}
      </div>

      <div className="px-2 py-1.5 bg-white border-b border-gray-100">
        <div className="relative">
          <Search
            size={11}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            placeholder={`Search ${activeTab.toLowerCase()}…`}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-44">
        {loading ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center">
            No {activeTab.toLowerCase()}s found.
          </div>
        ) : (
          filtered.map((dept) => (
            <SelectItem
              key={dept.id}
              value={String(dept.id)}
              className="pl-3 [&>span:first-child]:hidden"
            >
              {dept.name}
            </SelectItem>
          ))
        )}
      </div>
    </SelectContent>
  );
}
