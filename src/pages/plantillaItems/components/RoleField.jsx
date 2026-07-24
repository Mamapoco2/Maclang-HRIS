import { X } from "lucide-react";
import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_OPTIONS } from "../helpers/constants";

export function RoleField({ value, onChange, placeholder = "Select role" }) {
  if (value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-slate-50">
        <span className="text-sm font-medium flex-1 truncate">{value}</span>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <Select onValueChange={onChange} value={value}>
      <FormControl>
        <SelectTrigger className="text-sm border-gray-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {ROLE_OPTIONS.map((r) => (
          <SelectItem
            key={r}
            value={r}
            className="pl-3 [&>span:first-child]:hidden"
          >
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
