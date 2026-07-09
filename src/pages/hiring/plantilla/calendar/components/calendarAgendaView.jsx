import React from "react";
import { IconClock } from "@tabler/icons-react";

export default function AgendaView({ currentDate, getEventsForDay }) {
  const getDates = () => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      const evs = getEventsForDay(d);
      if (evs.length > 0) items.push({ date: d, events: evs });
    }
    return items;
  };

  const schedule = getDates();

  if (schedule.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <p>No upcoming interviews found.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {schedule.map((day, idx) => (
          <div key={idx}>
            <div className="sticky top-0 mb-3 border-b bg-gray-50 py-2 font-bold text-gray-700">
              {day.date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="space-y-3">
              {day.events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow-sm"
                >
                  <h4 className="font-bold text-gray-900">{event.title}</h4>

                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <IconClock size={14} stroke={1.5} />
                      {event.startTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
