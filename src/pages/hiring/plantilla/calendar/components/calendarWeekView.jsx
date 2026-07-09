import React from "react";

export default function WeekView({ currentDate, getEventsForDay }) {
  const getBackgroundColor = (colorClass) => {
    const colorMap = {
      "bg-purple-500": "#a855f7",
      "bg-cyan-500": "#06b6d4",
      "bg-emerald-500": "#10b981",
    };
    return colorMap[colorClass] || "#a855f7";
  };

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

  const getEventsForDate = (date) => {
    if (!getEventsForDay || typeof getEventsForDay !== "function") {
      console.warn("getEventsForDay function not provided to WeekView");
      return [];
    }
    const dayObj = {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: true,
      monthOffset: 0,
    };
    return getEventsForDay(dayObj) || [];
  };

  return (
    <div className="h-full overflow-y-auto border-t bg-white">
      <div className="grid min-w-[800px] grid-cols-8">
        <div className="h-12 border-b border-r bg-gray-50"></div>
        {days.map((day, i) => {
          const isToday = new Date().toDateString() === day.toDateString();
          return (
            <div
              key={i}
              className="flex h-12 flex-col items-center justify-center border-b border-r bg-gray-50"
            >
              <span className="text-xs uppercase text-gray-500">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span
                className={`font-bold ${isToday ? "flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white" : ""}`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}

        {Array.from({ length: 24 }).map((_, hour) => (
          <React.Fragment key={hour}>
            <div className="h-16 border-b border-r bg-gray-50 pr-2 pt-1 text-right text-[10px] text-gray-400">
              {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
            </div>
            {days.map((day, dayIdx) => {
              const dayEvents = getEventsForDate(day).filter((e) => !e.allDay);
              return (
                <div
                  key={dayIdx}
                  className="relative h-16 border-b border-r bg-white hover:bg-gray-50"
                >
                  {dayEvents.map((event) => {
                    const totalMinutes = parseTimeToOffset(event.startTime);
                    const eventHour = Math.floor(totalMinutes / 60);
                    if (eventHour !== hour) return null;

                    const topOffset = ((totalMinutes % 60) / 60) * 64;
                    return (
                      <div
                        key={event.id}
                        className="absolute inset-x-1 z-10 rounded p-1 text-[10px] text-white"
                        style={{
                          top: `${topOffset}px`,
                          minHeight: "30px",
                          backgroundColor: getBackgroundColor(
                            event.color || "bg-purple-500",
                          ),
                        }}
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
