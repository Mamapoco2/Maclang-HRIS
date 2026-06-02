import { useState, useEffect } from "react";
import { PageHeader } from "./PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LeaveTypeBadge } from "./StatusBadge";
import { LEAVE_REQUESTS, HOLIDAYS, LEAVE_TYPES } from "./mockData";
import { formatDate } from "./utils";
import { initializeAutoYearlyUpdate } from "@/services/holidayService"; // adjust path if needed
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isDateInRange(date, start, end) {
  return date >= new Date(start) && date <= new Date(end);
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [filter, setFilter] = useState("all");
  const [holidays, setHolidays] = useState(HOLIDAYS); // fallback to mock

  useEffect(() => {
    const cleanup = initializeAutoYearlyUpdate((updatedHolidays) => {
      const currentYear = updatedHolidays.currentYear;
      const nextYear = updatedHolidays.nextYear;
      const allHolidays = [
        ...(updatedHolidays[currentYear] ?? []),
        ...(updatedHolidays[nextYear] ?? []),
      ];
      setHolidays(allHolidays);
    });

    return () => cleanup();
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const approvedLeaves = LEAVE_REQUESTS.filter(
    (r) => r.status === "approved" || r.status === "pending",
  );
  const filteredLeaves =
    filter === "all"
      ? approvedLeaves
      : approvedLeaves.filter((r) => r.leaveType === filter);

  const getEventsForDay = (day) => {
    const date = new Date(year, month, day);
    const leaves = filteredLeaves.filter((r) =>
      isDateInRange(date, r.startDate, r.endDate),
    );
    const holiday = holidays.find((h) => {
      const hd = new Date(h.date);
      return (
        hd.getFullYear() === year &&
        hd.getMonth() === month &&
        hd.getDate() === day
      );
    });
    return { leaves, holiday };
  };

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const getLtColor = (type) =>
    LEAVE_TYPES.find((t) => t.value === type)?.color || "#6366f1";
  const getLtBg = (type) =>
    LEAVE_TYPES.find((t) => t.value === type)?.bg || "#eef2ff";

  const monthLeaves = filteredLeaves.filter((r) => {
    const s = new Date(r.startDate);
    const e = new Date(r.endDate);
    return (
      (s.getFullYear() === year && s.getMonth() === month) ||
      (e.getFullYear() === year && e.getMonth() === month) ||
      (s < new Date(year, month, 1) && e > new Date(year, month, daysInMonth))
    );
  });

  const monthHolidays = holidays.filter((h) => {
    const hd = new Date(h.date);
    return hd.getFullYear() === year && hd.getMonth() === month;
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Team Calendar"
        description="View and track team leave schedule"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setMonth(today.getMonth());
                    setYear(today.getFullYear());
                  }}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={next}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter("all")}
                className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-all ${filter === "all" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"}`}
              >
                All Types
              </button>
              {LEAVE_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  onClick={() => setFilter(lt.value)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all"
                  style={
                    filter === lt.value
                      ? { background: lt.color, color: "white" }
                      : { background: lt.bg, color: lt.color }
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {lt.label}
                </button>
              ))}
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[80px] border-b border-r border-[var(--border)] bg-[var(--muted)]/20"
                />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
                  const { leaves, holiday } = getEventsForDay(day);
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === month &&
                    today.getFullYear() === year;
                  const isWeekend =
                    new Date(year, month, day).getDay() % 6 === 0;
                  const holidayName = holiday?.name ?? holiday?.localName;
                  return (
                    <div
                      key={day}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`min-h-[80px] p-2 border-b border-r border-[var(--border)] transition-colors cursor-pointer relative group
                        ${isWeekend ? "bg-[var(--muted)]/30" : ""}
                        ${isToday ? "bg-indigo-50 dark:bg-indigo-950/20" : "hover:bg-[var(--muted)]/50"}
                      `}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-colors
                          ${isToday ? "bg-[var(--primary)] text-white" : "text-[var(--foreground)] hover:bg-[var(--border)]"}
                        `}
                      >
                        {day}
                      </span>
                      {holiday && (
                        <div className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 truncate">
                          🎉 {holidayName}
                        </div>
                      )}
                      {leaves.slice(0, 2).map((leave) => (
                        <div
                          key={leave.id}
                          className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium truncate"
                          style={{
                            background: getLtBg(leave.leaveType),
                            color: getLtColor(leave.leaveType),
                          }}
                          title={`${leave.employeeName} - ${leave.leaveType}`}
                        >
                          {leave.employeeName.split(" ")[0]}
                        </div>
                      ))}
                      {leaves.length > 2 && (
                        <div className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                          +{leaves.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Leave Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {LEAVE_TYPES.map((lt) => (
                <div key={lt.value} className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: lt.color }}
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    {lt.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 pt-1 border-t border-[var(--border)]">
                <span className="text-base">🎉</span>
                <span className="text-sm text-[var(--foreground)]">
                  Holiday
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Holidays This Month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Holidays in {MONTHS[month]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthHolidays.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No holidays this month
                </p>
              ) : (
                monthHolidays.map((h) => {
                  const dateObj = new Date(h.date);
                  const day = dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  const num = dateObj.getDate();
                  const holidayName = h.name ?? h.localName;
                  return (
                    <div
                      key={h.id ?? h.date}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"
                    >
                      <div className="flex flex-col items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex-shrink-0">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                          {day.toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                          {num}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-snug">
                        {holidayName}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* This Month Leaves */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">On Leave This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthLeaves.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No leaves this month
                </p>
              ) : (
                monthLeaves.map((r) => (
                  <div key={r.id} className="space-y-0.5">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {r.employeeName}
                    </p>
                    <div className="flex items-center gap-2">
                      <LeaveTypeBadge type={r.leaveType} />
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(r.startDate)} — {formatDate(r.endDate)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
