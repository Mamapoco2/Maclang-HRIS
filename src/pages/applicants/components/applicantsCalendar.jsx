import React, { useState, useMemo } from "react";
import Header from "./calendarHeader";
import CreateEventDialog from "./createEventModal";
import CalendarGrid from "./calendarGrid";
import { Card } from "@/components/ui/card";
import { useCalendar } from "../../../hooks/useCalendar";
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
    startDate: "",
    endDate: "",
    startTime: "",
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

  // ✅ Add monthOffset for prev/next month cells
  const calendarDays = useMemo(() => {
    const days = [];

    const prevMonthDays = calendarService.getDaysInMonth(
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear(),
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1
    );

    // previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        monthOffset: -1,
        isCurrentMonth: false,
      });
    }

    // current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        monthOffset: 0,
        isCurrentMonth: true,
      });
    }

    // next month
    let nextMonthDay = 1;
    while (days.length < 42) {
      days.push({
        day: nextMonthDay++,
        monthOffset: 1,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [firstDayOfMonth, daysInMonth, currentDate]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startDate) return;

    const startDate = new Date(newEvent.startDate);
    const endDate = newEvent.endDate ? new Date(newEvent.endDate) : startDate;

    addEvent({
      id: crypto.randomUUID(),
      ...newEvent,
      startDate,
      endDate,
      color: newEvent.color.replace("-500", "-200"),
    });

    setNewEvent({
      title: "",
      startDate: "",
      endDate: "",
      startTime: "",
      color: "bg-cyan-500",
    });
    setIsDialogOpen(false);
  };

  return (
    <Card className="h-[900px] flex flex-col">
      <Header
        currentDate={currentDate}
        view={view}
        setView={setView}
        nextMonth={nextMonth}
        prevMonth={prevMonth}
        goToToday={goToToday}
        onOpenDialog={() => setIsDialogOpen(true)}
      />

      <CreateEventDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSave={handleAddEvent}
      />

      {view === "Month" && (
        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          getEventsForDay={getEventsForDay}
        />
      )}
    </Card>
  );
}
