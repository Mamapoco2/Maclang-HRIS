import React from "react";

const HOURS = Array.from({ length: 24 }).map((_, i) => i);

function formatHour(hour) {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${ampm}`;
}

export default function DayView({ currentDate, getEventsForDay }) {
  const events = getEventsForDay(currentDate);
  const hourHeight = 64;

  const now = new Date();
  const isToday = now.toDateString() === currentDate.toDateString();
  const currentHour = isToday ? now.getHours() + now.getMinutes() / 60 : null;
  const currentLineTop = currentHour !== null ? currentHour * hourHeight : null;

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="flex flex-1 overflow-auto relative">
        {/* Time column */}
        <div className="w-20 flex flex-col border-r border-gray-200 bg-white select-none sticky left-0 z-10">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-end pr-3 pt-1 text-xs font-medium text-gray-600"
              style={{ height: hourHeight }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Event grid */}
        <div className="flex-1 relative bg-white">
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-t border-gray-100"
                style={{
                  top: hour * hourHeight,
                  position: "absolute",
                  left: 0,
                  right: 0,
                }}
              />
            ))}
          </div>

          {/* Current time indicator */}
          {isToday && (
            <div
              className="absolute left-0 right-0 flex items-center z-20"
              style={{ top: currentLineTop, height: 2, pointerEvents: "none" }}
            >
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          )}

          {/* Events */}
          {events.map((event) => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate || event.startDate);

            const eventStartHour = start.getHours() + start.getMinutes() / 60;
            const eventEndHour = end.getHours() + end.getMinutes() / 60;

            const top = eventStartHour * hourHeight;
            const height = Math.max(
              (eventEndHour - eventStartHour) * hourHeight,
              hourHeight / 2
            );

            return (
              <div
                key={event.id}
                className="absolute left-2 right-2 bg-blue-500 hover:bg-blue-600 rounded-lg p-3 text-white text-sm overflow-hidden cursor-pointer transition-colors shadow-sm border border-blue-600"
                style={{
                  top: top + 1,
                  height: height - 2,
                }}
                title={`${event.title}\n${start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              >
                <div className="font-semibold truncate mb-0.5">
                  {event.title}
                </div>
                <div className="text-xs text-blue-100 truncate">
                  {start.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {end.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
