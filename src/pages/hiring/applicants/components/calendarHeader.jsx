import React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calendarService } from "../../../../services/calendarService";

export default function Header({
  currentDate,
  view,
  setView,
  nextMonth,
  prevMonth,
  goToToday,
  onOpenDialog,
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-4">
        <Button onClick={goToToday} variant="outline">
          Today
        </Button>

        <div className="flex items-center gap-2">
          <Button onClick={prevMonth} variant="ghost" size="icon">
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={nextMonth} variant="ghost" size="icon">
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h1 className="text-2xl font-semibold">
          {calendarService.formatDate(currentDate)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {view}
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-32">
            {["Month", "Week", "Day", "Agenda"].map((label) => (
              <DropdownMenuItem
                key={label}
                onClick={() => setView(label)}
                className="justify-between"
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="bg-black text-white hover:bg-gray-800"
          onClick={onOpenDialog}
        >
          <IconPlus className="h-4 w-4 mr-2" /> New event
        </Button>
      </div>
    </div>
  );
}
