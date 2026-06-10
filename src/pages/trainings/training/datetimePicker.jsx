import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function DateTimePicker({
  label,
  date,
  setDate,
  hours,
  minutes,
  ampm,
  setHours,
  setMinutes,
  setAmPm,
}) {
  const displayValue = () => {
    if (!date) return label;
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${dateStr}, ${h}:${m} ${ampm}`;
  };

  const selectClass =
    "border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="flex-1">
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <button className="w-full h-9 text-left text-sm px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors truncate focus:outline-none focus:ring-2 focus:ring-blue-500">
            {displayValue()}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-3 rounded-xl border border-gray-100 shadow-lg"
          side="bottom"
          align="start"
          avoidCollisions
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(d) => {
              if (!d) return;
              setDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
            }}
          />

          <div className="flex gap-2 items-center pt-3 border-t border-gray-100 mt-2">
            <select
              value={String(hours).padStart(2, "0")}
              onChange={(e) => setHours(e.target.value)}
              className={`${selectClass} w-16`}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = String(i + 1).padStart(2, "0");
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
            <span className="text-gray-300 font-semibold">:</span>
            <select
              value={String(minutes).padStart(2, "0")}
              onChange={(e) => setMinutes(e.target.value)}
              className={`${selectClass} w-16`}
            >
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select
              value={ampm}
              onChange={(e) => setAmPm(e.target.value)}
              className={`${selectClass} w-16`}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
