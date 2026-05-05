import { calendarService } from "@/services/calendarService";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLOR_MAP = {
  "bg-cyan-500": "#06b6d4",
  "bg-yellow-400": "#facc15",
  "bg-purple-500": "#a855f7",
  "bg-pink-500": "#ec4899",
  "bg-emerald-500": "#10b981",
  "bg-orange-500": "#f97316",
};

function getBackgroundColor(colorClass) {
  return COLOR_MAP[colorClass] || "#06b6d4";
}

const TYPE_LABEL = {
  event: { label: "EVENT", bg: "bg-blue-100 text-blue-700" },
  applicant_applied: { label: "APPLIED", bg: "bg-cyan-100 text-cyan-700" },
  applicant_interview: {
    label: "INTERVIEW",
    bg: "bg-purple-100 text-purple-700",
  },
};

export default function CalendarGrid({
  currentDate,
  calendarDays,
  getEventsForDay,
  onDeleteEvent,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const weekDays = 7;
  const weeks = [];
  if (calendarDays?.length > 0) {
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
    return date
      .toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();
  };

  return (
    <>
      {!calendarDays || calendarDays.length === 0 ? (
        <div className="flex items-center justify-center h-96 border border-gray-200 rounded-lg">
          <p className="text-gray-500">LOADING CALENDAR...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="relative">
              <div className="grid grid-cols-7">
                {week.map((dayObj, idx) => {
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
                      className={`relative min-h-[120px] p-2 border-r border-b border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer
                        ${dayObj.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                        ${idx === 6 ? "border-r-0" : ""}
                        ${weekIndex === weeks.length - 1 ? "border-b-0" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div
                          className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday(dayObj) ? "bg-blue-600 text-white" : dayObj.isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}
                        >
                          {dayObj.day}
                        </div>
                      </div>
                      <div className="space-y-1 mt-1">
                        {singleDayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="text-white text-xs px-2 py-1 rounded truncate uppercase"
                            style={{
                              backgroundColor: getBackgroundColor(
                                event.color ?? "bg-cyan-500",
                              ),
                            }}
                            title={event.title?.toUpperCase()}
                          >
                            {event.title?.toUpperCase()}
                          </div>
                        ))}
                        {singleDayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{singleDayEvents.length - 3} MORE
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
                    getEventsForDay(dayObj).forEach((event) => {
                      if (!weekEvents.has(event.id))
                        weekEvents.set(event.id, event);
                    });
                  });

                  return Array.from(weekEvents.values()).map((event) => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate || event.startDate);
                    if (calendarService.isSameDay(start, end)) return null;

                    let startIdx = -1,
                      endIdx = -1;
                    week.forEach((dayObj, idx) => {
                      const checkDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + (dayObj.monthOffset || 0),
                        dayObj.day,
                      );
                      const c = new Date(
                        checkDate.getFullYear(),
                        checkDate.getMonth(),
                        checkDate.getDate(),
                      );
                      const s = new Date(
                        start.getFullYear(),
                        start.getMonth(),
                        start.getDate(),
                      );
                      const e = new Date(
                        end.getFullYear(),
                        end.getMonth(),
                        end.getDate(),
                      );
                      if (c >= s && c <= e) {
                        if (startIdx === -1) startIdx = idx;
                        endIdx = idx;
                      }
                    });

                    if (startIdx === -1) return null;
                    const span = endIdx - startIdx + 1;
                    const cellWidth = 100 / 7;

                    return (
                      <div
                        key={`${event.id}-week-${weekIndex}`}
                        className="absolute pointer-events-auto group"
                        style={{
                          top: "36px",
                          left: `${startIdx * cellWidth}%`,
                          width: `${span * cellWidth}%`,
                          padding: "0 8px",
                        }}
                        title={event.title?.toUpperCase()}
                      >
                        <div
                          className="text-white text-xs px-2 py-1 rounded truncate shadow-sm uppercase"
                          style={{
                            backgroundColor: getBackgroundColor(
                              event.color ?? "bg-cyan-500",
                            ),
                          }}
                        >
                          {event.title?.toUpperCase()}
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
              getEventsForDay(selectedDay).map((event) => {
                const typeInfo = TYPE_LABEL[event.type] ?? TYPE_LABEL.event;
                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 min-h-[50px] rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: getBackgroundColor(
                            event.color ?? "bg-cyan-500",
                          ),
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeInfo.bg} mb-1 inline-block`}
                        >
                          {typeInfo.label}
                        </span>
                        <h3 className="font-semibold text-sm text-gray-900 truncate uppercase">
                          {event.title}
                        </h3>
                        {event.startTime && !event.allDay && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            🕐 {event.startTime?.toUpperCase()}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            📍 {event.location?.toUpperCase()}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-xs text-gray-400 mt-1 truncate uppercase">
                            {event.description}
                          </p>
                        )}
                        {event.status && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 mt-1 inline-block uppercase">
                            {event.status}
                          </span>
                        )}
                      </div>
                      {event.type === "event" && onDeleteEvent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEvent(event.id);
                            setShowDayModal(false);
                          }}
                          className="text-gray-300 hover:text-red-500 transition-colors text-xs flex-shrink-0"
                          title="DELETE EVENT"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">
                NO EVENTS FOR THIS DAY
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
