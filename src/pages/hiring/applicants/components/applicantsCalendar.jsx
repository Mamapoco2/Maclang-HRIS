import React, { useState, useMemo, useEffect } from "react";
import Header from "./calendarHeader";
import CreateEventDialog from "./createEventModal";
import CalendarGrid from "./calendarGrid";
import WeekView from "./calendarWeekView";
import { Card } from "@/components/ui/card";
import { useCalendar } from "@/hooks/useCalendar";
import { calendarService } from "@/services/calendarService";
import {
  getHiringEvents,
  createHiringEvent,
  deleteHiringEvent,
  getApplicants,
} from "@/services/hiringService";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

export default function EventsCalendar() {
  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    currentDate,
    view,
    setView,
    nextMonth,
    prevMonth,
    goToToday,
    getEventsForDay,
  } = useCalendar(apiEvents);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    color: "bg-cyan-500",
    description: "",
    location: "",
    allDay: false,
    interviewer_id: "",
    interviewees: [],
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    const [eventsData, applicantsRes] = await Promise.all([
      getHiringEvents(),
      getApplicants({ per_page: 500 }),
    ]);

    const applicants = applicantsRes.data ?? [];

    // ── Normalize hiring events ───────────────────────────────────────────
    const normalizedEvents = eventsData.map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      description: e.description,
      location: e.location,
      color: e.color ?? "bg-cyan-500",
      allDay: e.all_day,
      startDate: e.start_date,
      endDate: e.end_date,
      startTime: e.start_time,
      interviewer: e.interviewer,
      applicants: e.applicants ?? [],
      type: "event",
    }));

    // ── Map applicants with date_applied as events ────────────────────────
    const applicantDateEvents = applicants
      .filter((a) => a.date_applied)
      .map((a) => ({
        id: `applicant-applied-${a.id}`,
        title: `${a.full_name}${a.position ? ` — ${a.position}` : ""}`,
        description: `Applied on ${a.date_applied}`,
        color: statusColor(a.status),
        allDay: true,
        startDate: a.date_applied,
        endDate: a.date_applied,
        startTime: null,
        type: "applicant_applied",
        applicantId: a.id,
        status: a.status,
      }));

    // ── Map applicants with hr_scheduled_at as events ─────────────────────
    const applicantInterviewEvents = applicants
      .filter((a) => a.interview?.hr_scheduled_at)
      .map((a) => ({
        id: `applicant-interview-${a.id}`,
        title: `Interview: ${a.full_name}${a.position ? ` — ${a.position}` : ""}`,
        description: `HR Interview`,
        color: "bg-purple-500",
        allDay: false,
        startDate: a.interview.hr_scheduled_at,
        endDate: a.interview.hr_scheduled_at,
        startTime: new Date(a.interview.hr_scheduled_at).toLocaleTimeString(
          "en-US",
          { hour: "numeric", minute: "2-digit" },
        ),
        type: "applicant_interview",
        applicantId: a.id,
        status: a.status,
      }));

    setApiEvents([
      ...normalizedEvents,
      ...applicantDateEvents,
      ...applicantInterviewEvents,
    ]);
    setLoading(false);
  };

  // ── Color per applicant status ────────────────────────────────────────────
  function statusColor(status) {
    const map = {
      "For Interview": "bg-cyan-500",
      Hired: "bg-emerald-500",
      Rejected: "bg-pink-500",
      "No Show": "bg-orange-500",
      Pending: "bg-yellow-400",
    };
    return map[status] ?? "bg-cyan-500";
  }

  // ── Calendar grid helpers ─────────────────────────────────────────────────
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

  // ── Save new event ────────────────────────────────────────────────────────
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.startDate) return;

    setSaving(true);
    try {
      await createHiringEvent({
        title: newEvent.title,
        description: newEvent.description || null,
        location: newEvent.location || null,
        color: newEvent.color,
        all_day: newEvent.allDay ?? false,
        start_date: newEvent.startDate,
        end_date: newEvent.endDate || null,
        start_time: newEvent.startTime || null,
        interviewer_id: newEvent.interviewer_id || null,
        applicant_ids: newEvent.interviewees ?? [],
      });

      toast.success("Event created successfully.");
      setNewEvent({
        title: "",
        startDate: "",
        endDate: "",
        startTime: "",
        color: "bg-cyan-500",
        description: "",
        location: "",
        allDay: false,
        interviewer_id: "",
        interviewees: [],
      });
      setIsDialogOpen(false);
      await loadAll();
    } catch (err) {
      console.error("createHiringEvent:", err);
      toast.error(err?.response?.data?.message ?? "Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete event ──────────────────────────────────────────────────────────
  const handleDeleteEvent = async (eventId) => {
    // Only hiring events can be deleted (not applicant-generated events)
    if (!String(eventId).startsWith("event-")) {
      toast.error(
        "Applicant events cannot be deleted here. Update the applicant record instead.",
      );
      return;
    }
    const realId = String(eventId).replace("event-", "");
    if (!confirm("Delete this event?")) return;
    try {
      await deleteHiringEvent(realId);
      toast.success("Event deleted.");
      await loadAll();
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  if (loading) {
    return (
      <Card className="h-[900px] flex items-center justify-center">
        <IconLoader2 size={28} className="animate-spin text-gray-400" />
      </Card>
    );
  }

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
        saving={saving}
      />

      {view === "Month" && (
        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          getEventsForDay={getEventsForDay}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {view === "Week" && (
        <WeekView currentDate={currentDate} getEventsForDay={getEventsForDay} />
      )}

      {view === "Day" && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Day view — Coming soon</p>
        </div>
      )}

      {view === "Agenda" && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Agenda view — Coming soon</p>
        </div>
      )}
    </Card>
  );
}
