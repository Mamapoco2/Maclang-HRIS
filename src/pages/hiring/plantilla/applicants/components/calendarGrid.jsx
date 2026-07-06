import { calendarService } from "@/services/calendarService";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLOR_MAP = {
  "bg-purple-500": "#a855f7",
  "bg-cyan-500": "#06b6d4",
  "bg-emerald-500": "#10b981",
};

function getBackgroundColor(colorClass) {
  return COLOR_MAP[colorClass] || "#a855f7";
}

const TYPE_LABEL = {
  psb_interview: {
    label: "PSB INTERVIEW",
    bg: "bg-purple-100 text-purple-700",
  },
};

export default function CalendarGrid({
  currentDate,
  calendarDays,
  getEventsForDay,
  onReschedule,
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
        <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200">
          <p className="text-gray-500">LOADING CALENDAR...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="relative">
              <div className="grid grid-cols-7">
                {week.map((dayObj, idx) => {
                  const dayEvents = getEventsForDay(dayObj);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(dayObj)}
                      className={`relative min-h-[120px] cursor-pointer border-b border-r border-gray-200 p-2 transition-colors hover:bg-gray-50
                        ${dayObj.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                        ${idx === 6 ? "border-r-0" : ""}
                        ${weekIndex === weeks.length - 1 ? "border-b-0" : ""}`}
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold
                          ${isToday(dayObj) ? "bg-blue-600 text-white" : dayObj.isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}
                        >
                          {dayObj.day}
                        </div>
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="truncate rounded px-2 py-1 text-xs uppercase text-white"
                            style={{
                              backgroundColor: getBackgroundColor(
                                event.color ?? "bg-purple-500",
                              ),
                            }}
                            title={event.title?.toUpperCase()}
                          >
                            {event.title?.toUpperCase()}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="px-2 text-xs text-gray-500">
                            +{dayEvents.length - 3} MORE
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedDay && formatDate(selectedDay)}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
              getEventsForDay(selectedDay).map((event) => {
                const typeInfo =
                  TYPE_LABEL[event.type] ?? TYPE_LABEL.psb_interview;
                return (
                  <div
                    key={event.id}
                    className="rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="min-h-[50px] w-1 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: getBackgroundColor(
                            event.color ?? "bg-purple-500",
                          ),
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <span
                          className={`mb-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${typeInfo.bg}`}
                        >
                          {typeInfo.label}
                        </span>
                        <h3 className="truncate text-sm font-semibold uppercase text-gray-900">
                          {event.title}
                        </h3>
                        {event.startTime && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            🕐 {event.startTime?.toUpperCase()}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-1 truncate text-xs uppercase text-gray-400">
                            {event.description}
                          </p>
                        )}
                        {event.status && (
                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                            {event.status}
                          </span>
                        )}
                      </div>
                      {onReschedule && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReschedule(event);
                            setShowDayModal(false);
                          }}
                          className="flex-shrink-0 text-xs font-medium text-indigo-600 hover:underline"
                        >
                          RESCHEDULE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                NO INTERVIEWS FOR THIS DAY
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
