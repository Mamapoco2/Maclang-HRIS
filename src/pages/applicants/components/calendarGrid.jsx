import { calendarService } from "../../../services/calendarService";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CalendarGrid({
  currentDate,
  calendarDays,
  getEventsForDay,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const weekDays = 7;
  const weeks = [];

  // split days into weeks
  for (let i = 0; i < calendarDays.length; i += weekDays) {
    weeks.push(calendarDays.slice(i, i + weekDays));
  }

  const isToday = (dayObj) => {
    const today = new Date();
    const cellDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (dayObj.monthOffset || 0),
      dayObj.day
    );
    return calendarService.isSameDay(cellDate, today);
  };

  const handleDayClick = (dayObj) => {
    setSelectedDay(dayObj);
    setShowDayModal(true);
  };

  const formatDate = (dayObj) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (dayObj.monthOffset || 0),
      dayObj.day
    );
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="relative">
            <div className="grid grid-cols-7">
              {week.map((dayObj, idx) => {
                const cellDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + (dayObj.monthOffset || 0),
                  dayObj.day
                );

                const singleDayEvents = getEventsForDay(dayObj).filter(
                  (event) => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate || event.startDate);
                    return calendarService.isSameDay(start, end);
                  }
                );

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(dayObj)}
                    className={`relative min-h-[120px] p-2 border-r border-b border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer ${
                      dayObj.isCurrentMonth ? "bg-white" : "bg-gray-50"
                    } ${idx === 6 ? "border-r-0" : ""} ${
                      weekIndex === weeks.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    {/* Day number with today indicator */}
                    <div className="flex justify-between items-start mb-1">
                      <div
                        className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                          isToday(dayObj)
                            ? "bg-blue-600 text-white"
                            : dayObj.isCurrentMonth
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {dayObj.day}
                      </div>
                    </div>

                    {/* Single-day events */}
                    <div className="space-y-1 mt-1">
                      {singleDayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`${
                            event.color || "bg-purple-500"
                          } text-white text-xs px-2 py-1 rounded truncate`}
                          title={`${event.title}${
                            event.startTime ? ` - ${event.startTime}` : ""
                          }${event.location ? ` @ ${event.location}` : ""}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {singleDayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{singleDayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Multi-day events overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {(() => {
                // Get all unique events in this week
                const weekEvents = new Map();
                week.forEach((dayObj) => {
                  const events = getEventsForDay(dayObj);
                  events.forEach((event) => {
                    if (!weekEvents.has(event.id)) {
                      weekEvents.set(event.id, event);
                    }
                  });
                });

                return Array.from(weekEvents.values()).map((event) => {
                  const start = new Date(event.startDate);
                  const end = new Date(event.endDate || event.startDate);

                  // Skip single-day events (they're rendered in cells)
                  if (calendarService.isSameDay(start, end)) {
                    return null;
                  }

                  // Find the first day in this week where the event appears
                  let startIdx = -1;
                  let endIdx = -1;

                  week.forEach((dayObj, idx) => {
                    const checkDate = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + (dayObj.monthOffset || 0),
                      dayObj.day
                    );

                    // Normalize dates to midnight for proper comparison
                    const checkDateNormalized = new Date(
                      checkDate.getFullYear(),
                      checkDate.getMonth(),
                      checkDate.getDate()
                    );
                    const startNormalized = new Date(
                      start.getFullYear(),
                      start.getMonth(),
                      start.getDate()
                    );
                    const endNormalized = new Date(
                      end.getFullYear(),
                      end.getMonth(),
                      end.getDate()
                    );

                    if (
                      checkDateNormalized >= startNormalized &&
                      checkDateNormalized <= endNormalized
                    ) {
                      if (startIdx === -1) startIdx = idx;
                      endIdx = idx;
                    }
                  });

                  if (startIdx === -1) return null;

                  // Calculate span
                  const span = endIdx - startIdx + 1;

                  // Calculate the width and position
                  const cellWidth = 100 / 7; // percentage
                  const left = startIdx * cellWidth;
                  const width = span * cellWidth;

                  const tooltipText = `${event.title}${
                    event.startTime ? ` - ${event.startTime}` : ""
                  }${event.location ? ` @ ${event.location}` : ""}`;

                  return (
                    <div
                      key={`${event.id}-week-${weekIndex}`}
                      className="absolute pointer-events-auto group"
                      style={{
                        top: "36px",
                        left: `${left}%`,
                        width: `${width}%`,
                        padding: "0 8px",
                      }}
                      title={tooltipText}
                    >
                      <div
                        className={`${
                          event.color || "bg-purple-500"
                        } text-white text-xs px-2 py-1 rounded truncate shadow-sm transition-all group-hover:shadow-md `}
                      >
                        <span className="font-medium">{event.title}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Day Events Modal */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedDay && formatDate(selectedDay)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
              getEventsForDay(selectedDay).map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-1 min-h-[60px] ${
                        event.color || "bg-purple-500"
                      } rounded-full`}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      {event.startTime && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.allDay
                            ? "All day"
                            : `${event.startTime}${
                                event.endTime ? ` - ${event.endTime}` : ""
                              }`}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No events for this day
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
