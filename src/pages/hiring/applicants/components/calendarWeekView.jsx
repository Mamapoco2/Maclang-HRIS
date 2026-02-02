import React from "react";

export default function WeekView({ currentDate, getEventsForDay }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const parseTimeToOffset = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return hours * 60 + minutes;
  };

  return (
    <div className="h-full overflow-y-auto bg-white border-t">
      <div className="grid grid-cols-8 min-w-[800px]">
        <div className="bg-gray-50 border-r border-b h-12"></div>
        {days.map((day, i) => (
          <div
            key={i}
            className="bg-gray-50 border-r border-b h-12 flex flex-col items-center justify-center"
          >
            <span className="text-xs text-gray-500 uppercase">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span className="font-bold">{day.getDate()}</span>
          </div>
        ))}

        {Array.from({ length: 24 }).map((_, hour) => (
          <React.Fragment key={hour}>
            <div className="h-16 border-r border-b text-[10px] text-gray-400 text-right pr-2 pt-1 bg-gray-50">
              {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
            </div>
            {days.map((day, dayIdx) => {
              const dayEvents = getEventsForDay(day).filter((e) => !e.allDay);
              return (
                <div
                  key={dayIdx}
                  className="h-16 border-r border-b relative bg-white"
                >
                  {dayEvents.map((event) => {
                    const totalMinutes = parseTimeToOffset(event.startTime);
                    const eventHour = Math.floor(totalMinutes / 60);
                    if (eventHour !== hour) return null;

                    const topOffset = ((totalMinutes % 60) / 60) * 64; // 64px is row height
                    return (
                      <div
                        key={event.id}
                        className={`absolute inset-x-1 p-1 rounded text-white text-[10px] z-10 ${event.color}`}
                        style={{ top: `${topOffset}px`, minHeight: "30px" }}
                      >
                        {event.startTime} - {event.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
