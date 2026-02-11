import React from "react";

export default function WeekView({ currentDate, getEventsForDay }) {
  const getBackgroundColor = (colorClass) => {
    const colorMap = {
      "bg-cyan-500": "#06b6d4",
      "bg-yellow-400": "#facc15",
      "bg-purple-500": "#a855f7",
      "bg-pink-500": "#ec4899",
      "bg-emerald-500": "#10b981",
      "bg-orange-500": "#f97316",
    };
    return colorMap[colorClass] || "#06b6d4";
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

  // Helper to get events for a specific date (not dayObj)
  const getEventsForDate = (date) => {
    // Safety check - if getEventsForDay is not provided, return empty array
    if (!getEventsForDay || typeof getEventsForDay !== "function") {
      console.warn("getEventsForDay function not provided to WeekView");
      return [];
    }

    // Create a dayObj from the date
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
    <div className="h-full overflow-y-auto bg-white border-t">
      <div className="grid grid-cols-8 min-w-[800px]">
        <div className="bg-gray-50 border-r border-b h-12"></div>
        {days.map((day, i) => {
          const isToday = new Date().toDateString() === day.toDateString();
          return (
            <div
              key={i}
              className="bg-gray-50 border-r border-b h-12 flex flex-col items-center justify-center"
            >
              <span className="text-xs text-gray-500 uppercase">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span
                className={`font-bold ${isToday ? "bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center" : ""}`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}

        {Array.from({ length: 24 }).map((_, hour) => (
          <React.Fragment key={hour}>
            <div className="h-16 border-r border-b text-[10px] text-gray-400 text-right pr-2 pt-1 bg-gray-50">
              {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
            </div>
            {days.map((day, dayIdx) => {
              const dayEvents = getEventsForDate(day).filter((e) => !e.allDay);
              return (
                <div
                  key={dayIdx}
                  className="h-16 border-r border-b relative bg-white hover:bg-gray-50"
                >
                  {dayEvents.map((event) => {
                    const totalMinutes = parseTimeToOffset(event.startTime);
                    const eventHour = Math.floor(totalMinutes / 60);
                    if (eventHour !== hour) return null;

                    const topOffset = ((totalMinutes % 60) / 60) * 64; // 64px is row height
                    return (
                      <div
                        key={event.id}
                        className="absolute inset-x-1 p-1 rounded text-white text-[10px] z-10"
                        style={{
                          top: `${topOffset}px`,
                          minHeight: "30px",
                          backgroundColor: getBackgroundColor(
                            event.color || "bg-cyan-500",
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
