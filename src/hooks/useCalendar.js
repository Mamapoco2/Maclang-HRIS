import { useState, useCallback } from "react";

export function useCalendar(externalEvents = []) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("Month");
  const [localEvents, setLocalEvents] = useState([]);

  // Merge API events + local optimistic events
  const allEvents = [...externalEvents, ...localEvents];

  const nextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const prevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const addEvent = useCallback((event) => {
    setLocalEvents((prev) => [...prev, event]);
  }, []);

  const getEventsForDay = useCallback(
    (dayObj) => {
      let year, month, day;

      if (dayObj instanceof Date) {
        year = dayObj.getFullYear();
        month = dayObj.getMonth();
        day = dayObj.getDate();
      } else {
        year = currentDate.getFullYear();
        month = currentDate.getMonth() + (dayObj.monthOffset || 0);
        day = dayObj.day;
      }

      const target = new Date(year, month, day);
      target.setHours(0, 0, 0, 0);

      return allEvents.filter((event) => {
        const start = new Date(event.startDate ?? event.start_date);
        const end = new Date(
          event.endDate ??
            event.end_date ??
            event.startDate ??
            event.start_date,
        );
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return target >= start && target <= end;
      });
    },
    [allEvents, currentDate],
  );

  return {
    currentDate,
    view,
    setView,
    nextMonth,
    prevMonth,
    goToToday,
    addEvent,
    getEventsForDay,
    localEvents,
    setLocalEvents,
  };
}
