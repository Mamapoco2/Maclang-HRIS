import { calendarService } from "../../../services/calendarService";

export default function CalendarGrid({
  currentDate,
  calendarDays,
  getEventsForDay,
}) {
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (day) => {
    if (!day) return false;
    return calendarService.isSameDay(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      today
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map((d) => (
          <div
            key={d}
            className="p-3 text-center text-sm font-medium text-gray-500"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((day, idx) => {
          const events = day ? getEventsForDay(day) : [];
          const visible = events.slice(0, 2);
          const extra = events.length - 2;

          return (
            <div
              key={idx}
              className={`bg-white min-h-32 p-2 ${
                day ? "hover:bg-gray-50 cursor-pointer" : ""
              }`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isToday(day)
                        ? "w-8 h-8 flex items-center justify-center bg-black text-white rounded-full"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-1">
                    {visible.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded w-full block ${event.color} truncate`}
                      >
                        {event.time && (
                          <span className="font-medium">{event.time} </span>
                        )}
                        {event.title}
                      </div>
                    ))}

                    {extra > 0 && (
                      <div className="text-xs text-gray-500 pl-1">
                        + {extra} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
