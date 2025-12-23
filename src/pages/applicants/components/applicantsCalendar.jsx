import React, { useState, useMemo } from "react";
import Header from "./calendarHeader";
import CreateEventDialog from "./createEventModal";
import CalendarGrid from "./calendarGrid";
import { Card } from "@/components/ui/card";
import { useCalendar } from "../../../hooks/useCaldendar";
import { calendarService } from "../../../services/calendarService";
import DayView from "./calendarDayView";
import WeekView from "./calendarWeekView";
import AgendaView from "./calendarAgendaView";

export default function EventsCalendar() {
  const {
    currentDate,
    view,
    setView,
    nextMonth,
    prevMonth,
    goToToday,
    addEvent,
    getEventsForDay,
  } = useCalendar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "10:00 AM",
    allDay: false,
    location: "",
    color: "bg-cyan-500",
  });

  const daysInMonth = calendarService.getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const firstDayOfMonth = calendarService.getFirstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const calendarDays = useMemo(() => {
    const days = [];

    // Get previous month's details
    const prevMonthDays = calendarService.getDaysInMonth(
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear(),
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1
    );

    // Add days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isPrevMonth: false,
      });
    }

    // Add days from next month to complete 6 weeks (42 cells)
    let nextMonthDay = 1;
    while (days.length < 42) {
      days.push({
        day: nextMonthDay++,
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }

    return days;
  }, [firstDayOfMonth, daysInMonth, currentDate]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startDate) return;

    const eventStartDate = new Date(newEvent.startDate);
    const eventEndDate = newEvent.endDate
      ? new Date(newEvent.endDate)
      : eventStartDate;

    addEvent({
      ...newEvent,
      date: eventStartDate,
      startDate: eventStartDate,
      endDate: eventEndDate,
      color: newEvent.color.replace("-500", "-200"),
    });

    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "10:00 AM",
      allDay: false,
      location: "",
      color: "bg-cyan-500",
    });
    setIsDialogOpen(false);
  };

  return (
    <Card className="h-[900px] flex flex-col">
      {" "}
      {/* ADD THESE CLASSES */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        {" "}
        {/* ADD THESE CLASSES */}
        <Header
          currentDate={currentDate}
          view={view}
          setView={setView}
          goToToday={goToToday}
          nextMonth={nextMonth}
          prevMonth={prevMonth}
          onOpenDialog={() => setIsDialogOpen(true)}
        />
        <CreateEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onSave={handleAddEvent}
        />
        <div className="flex-1 min-h-0">
          {view === "Month" && (
            <CalendarGrid
              currentDate={currentDate}
              calendarDays={calendarDays}
              getEventsForDay={getEventsForDay}
            />
          )}

          {view === "Week" && (
            <WeekView
              currentDate={currentDate}
              getEventsForDay={getEventsForDay}
            />
          )}

          {view === "Day" && (
            <DayView
              currentDate={currentDate}
              getEventsForDay={getEventsForDay}
            />
          )}

          {view === "Agenda" && (
            <AgendaView
              currentDate={currentDate}
              getEventsForDay={getEventsForDay}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
