import React from "react";

const HOURS = Array.from({ length: 24 }).map((_, i) => i); // 0-23

export default function WeekView({ currentDate, getEventsForDay }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  // Format hour label, e.g., "1 AM"
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h} ${ampm}`;
  };

  const getAllDayEvents = (day) => getEventsForDay(day).filter((e) => e.allDay);

  const getTimedEvents = (day) => getEventsForDay(day).filter((e) => !e.allDay);

  // Height per hour row (can be adjusted)
  const hourRowHeight = 48;

  return (
    <div className="border rounded h-full w-full overflow-auto">
      <div
        className="grid grid-cols-8"
        style={{
          gridTemplateRows: `auto repeat(24, ${hourRowHeight}px)`,
          minWidth: 700,
        }}
      >
        {/* Top-left empty cell */}
        <div className="border-b border-r bg-gray-50"></div>

        {/* Days header (col 2-8, row 1) */}
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`border-b border-r p-2 text-center bg-gray-50 ${
              day.toDateString() === new Date().toDateString()
                ? "bg-gray-200 font-semibold"
                : ""
            }`}
            style={{ gridColumnStart: idx + 2, gridRowStart: 1 }}
          >
            <div>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
            <div className="font-medium">{day.getDate()}</div>

            {/* All-day events */}
            <div className="mt-1 space-y-1">
              {getAllDayEvents(day).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs rounded px-1 py-0.5 truncate ${event.color}`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Time labels (col 1, rows 2-25) */}
        {HOURS.map((hour, idx) => (
          <div
            key={hour}
            className="border-b border-r text-xs text-gray-500 pr-1 flex items-start justify-end select-none bg-gray-50"
            style={{
              gridColumnStart: 1,
              gridRowStart: idx + 2,
              height: hourRowHeight,
            }}
          >
            {formatHour(hour)}
          </div>
        ))}

        {/* Day hour cells (cols 2-8, rows 2-25) */}
        {days.map((day, dayIdx) =>
          HOURS.map((hour, hourIdx) => (
            <div
              key={`${dayIdx}-${hourIdx}`}
              className="border-b border-r relative"
              style={{
                gridColumnStart: dayIdx + 2,
                gridRowStart: hourIdx + 2,
                height: hourRowHeight,
              }}
            ></div>
          ))
        )}

        {/* Timed events positioned absolutely inside their cell */}
        {days.map((day, dayIdx) =>
          getTimedEvents(day).map((event) => {
            const eventDate = new Date(event.date);
            const startHour = eventDate.getHours();
            const startMinutes = eventDate.getMinutes();

            // For now, place event top with minute offset and height fixed to 1 hour
            const topOffset = (startMinutes / 60) * hourRowHeight;
            const eventHeight = hourRowHeight; // can be dynamic with end time

            return (
              <div
                key={event.id}
                className={`absolute left-0 right-0 mx-1 rounded px-1 text-xs overflow-hidden cursor-pointer ${event.color}`}
                title={event.title}
                style={{
                  gridColumnStart: dayIdx + 2,
                  gridRowStart: startHour + 2,
                  height: eventHeight,
                  top: topOffset,
                  position: "relative",
                  zIndex: 10,
                }}
              >
                {event.title}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
