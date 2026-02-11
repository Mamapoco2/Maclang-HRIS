import { calendarService } from "../../../../services/calendarService";
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

  const getBackgroundColor = (colorClass) => {
    const colorMap = {
      "bg-cyan-500": "#06b6d4",
      "bg-yellow-400": "#facc15",
      "bg-purple-500": "#a855f7",
      "bg-pink-500": "#ec4899",
      "bg-emerald-500": "#10b981",
      "bg-orange-500": "#f97316",
    };

    console.log("Color class received:", colorClass);

    if (!colorClass) {
      console.log("No color provided, using cyan default");
      return "#06b6d4";
    }

    const result = colorMap[colorClass];
    if (!result) {
      console.log(
        "Color not found in map, using cyan default. Available colors:",
        Object.keys(colorMap),
      );
    }

    return result || "#06b6d4";
  };

  const weekDays = 7;
  const weeks = [];

  if (calendarDays && calendarDays.length > 0) {
    for (let i = 0; i < calendarDays.length; i += weekDays) {
      weeks.push(calendarDays.slice(i, i + weekDays));
    }
  }

  const isToday = (dayObj) => {
    const today = new Date();
    const cellDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (dayObj.monthOffset || 0),
      dayObj.day,
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
      dayObj.day,
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
      {!calendarDays || calendarDays.length === 0 ? (
        <div className="flex items-center justify-center h-96 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Loading calendar...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="relative">
              <div className="grid grid-cols-7">
                {week.map((dayObj, idx) => {
                  const cellDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + (dayObj.monthOffset || 0),
                    dayObj.day,
                  );

                  const singleDayEvents = getEventsForDay(dayObj).filter(
                    (event) => {
                      const start = new Date(event.startDate);
                      const end = new Date(event.endDate || event.startDate);
                      return calendarService.isSameDay(start, end);
                    },
                  );

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(dayObj)}
                      className={`relative min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                        dayObj.isCurrentMonth
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800"
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
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-400 dark:text-gray-600"
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
                            className="text-white text-xs px-2 py-1 rounded truncate"
                            style={{
                              backgroundColor: getBackgroundColor(
                                event.color || "bg-cyan-500",
                              ),
                            }}
                            title={`${event.title}${
                              event.startTime ? ` - ${event.startTime}` : ""
                            }${event.location ? ` @ ${event.location}` : ""}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {singleDayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
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

                    if (calendarService.isSameDay(start, end)) {
                      return null;
                    }

                    let startIdx = -1;
                    let endIdx = -1;

                    week.forEach((dayObj, idx) => {
                      const checkDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + (dayObj.monthOffset || 0),
                        dayObj.day,
                      );

                      const checkDateNormalized = new Date(
                        checkDate.getFullYear(),
                        checkDate.getMonth(),
                        checkDate.getDate(),
                      );
                      const startNormalized = new Date(
                        start.getFullYear(),
                        start.getMonth(),
                        start.getDate(),
                      );
                      const endNormalized = new Date(
                        end.getFullYear(),
                        end.getMonth(),
                        end.getDate(),
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

                    const span = endIdx - startIdx + 1;
                    const cellWidth = 100 / 7;
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
                          className="text-white text-xs px-2 py-1 rounded truncate shadow-sm transition-all group-hover:shadow-md"
                          style={{
                            backgroundColor: getBackgroundColor(
                              event.color || "bg-cyan-500",
                            ),
                          }}
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
      )}

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
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 min-h-[60px] rounded-full"
                      style={{
                        backgroundColor: getBackgroundColor(
                          event.color || "bg-cyan-500",
                        ),
                      }}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {event.title}
                      </h3>
                      {event.startTime && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.allDay
                            ? "All day"
                            : `${event.startTime}${
                                event.endTime ? ` - ${event.endTime}` : ""
                              }`}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No events for this day
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
