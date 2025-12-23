import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample data for demonstration
const getSampleEvents = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      date: today,
      dateString: today.toISOString().split("T")[0],
      events: [
        {
          id: "1",
          title: "Team Standup",
          startDate: new Date(today.setHours(9, 0)),
          endDate: new Date(today.setHours(9, 30)),
          location: "Conference Room A",
          description: "Daily sync with the development team",
          color: "bg-blue-200",
        },
        {
          id: "2",
          title: "Lunch with Sarah",
          startDate: new Date(today.setHours(12, 30)),
          endDate: new Date(today.setHours(13, 30)),
          location: "Downtown Cafe",
          color: "bg-green-200",
        },
        {
          id: "3",
          title: "Design Review",
          startDate: new Date(today.setHours(15, 0)),
          endDate: new Date(today.setHours(16, 30)),
          location: "Zoom",
          description: "Review new landing page designs with stakeholders",
          color: "bg-purple-200",
        },
      ],
    },
    {
      date: tomorrow,
      dateString: tomorrow.toISOString().split("T")[0],
      events: [
        {
          id: "4",
          title: "Company All-Hands",
          startDate: tomorrow,
          endDate: tomorrow,
          allDay: true,
          description: "Quarterly company meeting and team building activities",
          color: "bg-orange-200",
        },
        {
          id: "5",
          title: "Client Presentation",
          startDate: new Date(tomorrow.setHours(14, 0)),
          endDate: new Date(tomorrow.setHours(15, 0)),
          location: "Client Office",
          description: "Present Q4 progress and roadmap",
          color: "bg-red-200",
        },
      ],
    },
    {
      date: nextWeek,
      dateString: nextWeek.toISOString().split("T")[0],
      events: [
        {
          id: "6",
          title: "Project Kickoff",
          startDate: new Date(nextWeek.setHours(10, 0)),
          endDate: new Date(nextWeek.setHours(11, 30)),
          location: "Conference Room B",
          description: "Kickoff meeting for new mobile app project",
          color: "bg-indigo-200",
        },
      ],
    },
  ];
};

export default function AgendaView({ currentDate, getEventsForDay }) {
  // Generate dates for the next 30 days from currentDate
  const getDatesWithEvents = () => {
    const dates = [];
    const startDate = new Date(currentDate);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const events = getEventsForDay(date);

      if (events && events.length > 0) {
        dates.push({
          date: date,
          dateString: date.toISOString().split("T")[0],
          events: events,
        });
      }
    }

    return dates;
  };

  let datesWithEvents = getDatesWithEvents();

  // If no real events, show sample data
  if (datesWithEvents.length === 0) {
    datesWithEvents = getSampleEvents();
  }

  // Empty state - only show if no sample data either
  if (datesWithEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No events scheduled</p>
          <p className="text-gray-400 text-sm mt-2">Your calendar is clear</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (compareDate.getTime() === today.getTime()) {
      return "Today";
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-10xl mx-auto p-6 space-y-8">
        {datesWithEvents.map(({ date, dateString, events }) => (
          <div key={dateString}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-lg font-bold text-gray-800">
                {formatDate(date)}
              </div>
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-sm text-gray-500">
                {events.length} {events.length === 1 ? "event" : "events"}
              </div>
            </div>

            <div className="space-y-3">
              {events.map((event) => {
                const startDate = new Date(event.startDate);
                const endDate = event.endDate
                  ? new Date(event.endDate)
                  : startDate;

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                      event.color
                        ? event.color
                            .replace("-200", "-500")
                            .replace("bg-", "border-")
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-2">
                          {event.title}
                        </h3>

                        <div className="space-y-1.5">
                          {event.allDay ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 shrink-0" />
                              <span>All day</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 shrink-0" />
                              <span>
                                {formatTime(startDate)} - {formatTime(endDate)}
                              </span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
