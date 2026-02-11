import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

// This is the DateTimePicker component, which allows picking a date and time.
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
  return (
    <div className="flex-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full text-left">
            {date
              ? date.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })
              : label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="space-y-3 w-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(new Date(d))}
          />

          <div className="flex gap-2">
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="border rounded px-2 py-1 w-1/3"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>

            <select
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="border rounded px-2 py-1 w-1/3"
            >
              {["00", "15", "30", "45"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              value={ampm}
              onChange={(e) => setAmPm(e.target.value)}
              className="border rounded px-2 py-1 w-1/3"
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
