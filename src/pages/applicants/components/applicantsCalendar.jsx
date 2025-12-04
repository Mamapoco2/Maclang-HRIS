import React, { useState, useMemo } from "react";
import Header from "./calendarHeader";
import CreateEventDialog from "./createEventModal";
import CalendarGrid from "./calendarGrid";
import { Card } from "@/components/ui/card";
import { useCalendar } from "../../../hooks/useCaldendar";
import { calendarService } from "../../../services/calendarService";

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
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayOfMonth, daysInMonth]);

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
    <Card>
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
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

        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          getEventsForDay={getEventsForDay}
        />
      </div>
    </Card>
  );
}
