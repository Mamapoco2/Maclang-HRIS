import { calendarService } from "../../../services/calendarService";

export default function CalendarGrid({
  currentDate,
  calendarDays,
  getEventsForDay,
}) {
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (dayObj) => {
    if (!dayObj || !dayObj.isCurrentMonth) return false;
    return calendarService.isSameDay(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day),
      today
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((d) => (
          <div
            key={d}
            className="p-2 text-center text-xs font-semibold text-gray-500 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 bg-gray-200 gap-px">
        {calendarDays.map((dayObj, idx) => {
          const dayEvents = dayObj.isCurrentMonth
            ? getEventsForDay(dayObj.day)
            : [];
          return (
            <div
              key={idx}
              className="bg-white p-1 min-h-[100px] flex flex-col group"
            >
              <span
                className={`text-xs font-bold p-1 w-7 h-7 flex items-center justify-center rounded-full 
                ${
                  isToday(dayObj)
                    ? "bg-black text-white"
                    : dayObj.isCurrentMonth
                    ? "text-gray-900"
                    : "text-gray-300"
                }`}
              >
                {dayObj.day}
              </span>
              <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`${event.color} text-[10px] text-white p-1 rounded truncate shadow-sm`}
                  >
                    {event.startTime && (
                      <span className="opacity-80 mr-1">{event.startTime}</span>
                    )}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
