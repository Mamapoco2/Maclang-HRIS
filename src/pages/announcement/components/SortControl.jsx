import { ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SORT_OPTIONS } from "../constants";

export function SortControl({ value, onChange }) {
  const current = SORT_OPTIONS.find((o) => o.key === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-s bg-green-600 text-white hover:bg-green-700 hover:text-white p-4.5  "
        >
          <ArrowUpDown size={16} />
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {SORT_OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.key}
            onClick={() => onChange(o.key)}
            className={value === o.key ? "text-blue-600 bg-blue-50" : ""}
          >
            <span className="flex-1">{o.label}</span>
            {value === o.key && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
