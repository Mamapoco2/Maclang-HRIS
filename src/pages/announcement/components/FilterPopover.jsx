import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRIORITY_CONFIG, FILTER_DEPARTMENTS } from "../constants";

export function FilterPopover({ filters, onChange, onClear }) {
  const active = Object.values(filters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${active ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700" : ""}`}
        >
          <Filter size={15} />
          Filters
          {active && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          <ChevronDown size={13} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Filter</span>
          <Button
            variant="link"
            className="h-auto p-0 text-xs text-blue-600"
            onClick={onClear}
          >
            Clear all
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Priority
            </p>
            <div className="space-y-1.5">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <Label
                  key={key}
                  className="flex items-center gap-2.5 font-normal cursor-pointer"
                >
                  <Checkbox
                    checked={filters.priorities?.includes(key) || false}
                    onCheckedChange={(checked) => {
                      const p = filters.priorities || [];
                      onChange({
                        ...filters,
                        priorities: checked
                          ? [...p, key]
                          : p.filter((x) => x !== key),
                      });
                    }}
                  />
                  <span className={`text-sm ${cfg.text}`}>{cfg.label}</span>
                </Label>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Department
            </p>
            <div className="space-y-1.5">
              {FILTER_DEPARTMENTS.map((dept) => (
                <Label
                  key={dept}
                  className="flex items-center gap-2.5 font-normal cursor-pointer"
                >
                  <Checkbox
                    checked={filters.departments?.includes(dept) || false}
                    onCheckedChange={(checked) => {
                      const p = filters.departments || [];
                      onChange({
                        ...filters,
                        departments: checked
                          ? [...p, dept]
                          : p.filter((x) => x !== dept),
                      });
                    }}
                  />
                  <span className="text-sm text-slate-600">{dept}</span>
                </Label>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Status
            </p>
            <div className="space-y-1.5">
              {[
                ["pinned", "Pinned only"],
                ["unread", "Unread only"],
              ].map(([key, label]) => (
                <Label
                  key={key}
                  className="flex items-center gap-2.5 font-normal cursor-pointer"
                >
                  <Checkbox
                    checked={filters[key] || false}
                    onCheckedChange={(checked) =>
                      onChange({ ...filters, [key]: checked })
                    }
                  />
                  <span className="text-sm text-slate-600">{label}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
