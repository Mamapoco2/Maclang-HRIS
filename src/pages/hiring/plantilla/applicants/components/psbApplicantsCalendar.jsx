import React, { useState, useMemo } from "react";
import Header from "./calendarHeader";
import CalendarGrid from "./calendarGrid";
import WeekView from "./calendarWeekView";
import DayView from "./calendarDayView";
import AgendaView from "./calendarAgendaView";
import RescheduleInterviewDialog from "./rescheduleInterviewDialog";
import { Card } from "@/components/ui/card";
import { useCalendar } from "@/hooks/useCalendar";
import { calendarService } from "@/services/calendarService";

const STAGE_LABELS = {
  hr: "HR Interview",
  head: "Head Interview",
  final: "Final Interview (PSB)",
};

const STAGE_COLORS = {
  hr: "bg-purple-500",
  head: "bg-cyan-500",
  final: "bg-emerald-500",
};

function candidateName(employee) {
  if (!employee) return "—";
  return (
    employee.full_name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

function buildEvents(applications) {
  const events = [];
  applications.forEach((application) => {
    const interview = application.interview;
    if (!interview) return;

    ["hr", "head", "final"].forEach((stage) => {
      const scheduledAt = interview[`${stage}_scheduled_at`];
      const stageStatus = interview[`${stage}_status`]?.toUpperCase();

      if (!scheduledAt || stageStatus !== "SCHEDULED") return;

      events.push({
        id: `psb-${application.id}-${stage}`,
        title: `${STAGE_LABELS[stage]}: ${candidateName(application.employee)}`,
        description: application.posting?.title ?? "",
        color: STAGE_COLORS[stage],
        allDay: false,
        startDate: scheduledAt,
        endDate: scheduledAt,
        startTime: new Date(scheduledAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        type: "psb_interview",
        applicationId: application.id,
        stage,
        status: stageStatus,
      });
    });
  });
  return events;
}

export default function PsbApplicantsCalendar({ applications, onRefresh }) {
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const apiEvents = useMemo(() => buildEvents(applications), [applications]);

  const {
    currentDate,
    view,
    setView,
    nextMonth,
    prevMonth,
    goToToday,
    getEventsForDay,
  } = useCalendar(apiEvents);

  const daysInMonth = calendarService.getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const firstDayOfMonth = calendarService.getFirstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthDays = calendarService.getDaysInMonth(
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear(),
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1,
    );

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        monthOffset: -1,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, monthOffset: 0, isCurrentMonth: true });
    }
    let nextDay = 1;
    while (days.length < 42) {
      days.push({ day: nextDay++, monthOffset: 1, isCurrentMonth: false });
    }
    return days;
  }, [firstDayOfMonth, daysInMonth, currentDate]);

  const handleReschedule = (event) => {
    const application = applications.find((a) => a.id === event.applicationId);
    if (!application) return;
    setRescheduleTarget({ application, stage: event.stage });
  };

  const handleRescheduled = () => {
    setRescheduleTarget(null);
    onRefresh();
  };

  return (
    <Card className="flex h-[900px] flex-col">
      <Header
        currentDate={currentDate}
        view={view}
        setView={setView}
        nextMonth={nextMonth}
        prevMonth={prevMonth}
        goToToday={goToToday}
      />

      {view === "Month" && (
        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          getEventsForDay={getEventsForDay}
          onReschedule={handleReschedule}
        />
      )}

      {view === "Week" && (
        <WeekView currentDate={currentDate} getEventsForDay={getEventsForDay} />
      )}

      {view === "Day" && (
        <DayView currentDate={currentDate} getEventsForDay={getEventsForDay} />
      )}

      {view === "Agenda" && (
        <AgendaView
          currentDate={currentDate}
          getEventsForDay={getEventsForDay}
        />
      )}

      <RescheduleInterviewDialog
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSaved={handleRescheduled}
      />
    </Card>
  );
}
