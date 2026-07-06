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
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="relative flex flex-1 overflow-auto">
        <div className="sticky left-0 z-10 flex w-20 select-none flex-col border-r border-gray-200 bg-white">
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

        <div className="relative flex-1 bg-white">
          <div className="pointer-events-none absolute inset-0">
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

          {isToday && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center"
              style={{ top: currentLineTop, height: 2, pointerEvents: "none" }}
            >
              <div className="-ml-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-0.5 flex-1 bg-red-500" />
            </div>
          )}

          {events.map((event) => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate || event.startDate);

            const eventStartHour = start.getHours() + start.getMinutes() / 60;
            const eventEndHour = end.getHours() + end.getMinutes() / 60;

            const top = eventStartHour * hourHeight;
            const height = Math.max(
              (eventEndHour - eventStartHour) * hourHeight,
              hourHeight / 2,
            );

            return (
              <div
                key={event.id}
                className="absolute left-2 right-2 cursor-pointer overflow-hidden rounded-lg border border-purple-600 bg-purple-500 p-3 text-sm text-white shadow-sm transition-colors hover:bg-purple-600"
                style={{ top: top + 1, height: height - 2 }}
                title={`${event.title}\n${start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              >
                <div className="mb-0.5 truncate font-semibold">
                  {event.title}
                </div>
                <div className="truncate text-xs text-purple-100">
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
