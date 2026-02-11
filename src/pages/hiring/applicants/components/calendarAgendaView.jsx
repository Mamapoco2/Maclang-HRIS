import React from "react";
import { IconClock, IconMapPin } from "@tabler/icons-react";

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
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <p>No upcoming events found.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {schedule.map((day, idx) => (
          <div key={idx}>
            <div className="sticky top-0 bg-gray-50 py-2 font-bold text-gray-700 border-b mb-3">
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
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 flex flex-col"
                  style={{
                    borderLeftColor: event.color.replace("bg-", ""),
                  }}
                >
                  <h4 className="font-bold text-gray-900">{event.title}</h4>

                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <IconClock size={14} stroke={1.5} />
                      {event.startTime}
                    </span>

                    {event.location && (
                      <span className="flex items-center gap-1">
                        <IconMapPin size={14} stroke={1.5} />
                        {event.location}
                      </span>
                    )}
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
