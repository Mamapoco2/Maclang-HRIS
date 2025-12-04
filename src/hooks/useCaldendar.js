import { useState } from 'react';
import { calendarService } from '../services/calendarService';

export const useCalendar = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState('Month');
  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', date: new Date(2025, 11, 4), time: '10am', color: 'bg-blue-200' },
    { id: 2, title: 'Lunch with Client', date: new Date(2025, 11, 5), time: '12pm', color: 'bg-green-200' },
    { id: 3, title: 'Product Launch', date: new Date(2025, 11, 7), time: '', color: 'bg-purple-200' },
    { id: 4, title: 'Sales Conference', date: new Date(2025, 11, 9), time: '2:30pm', color: 'bg-red-200' },
    { id: 5, title: 'Team Meeting', date: new Date(2025, 11, 9), time: '9am', color: 'bg-yellow-200' },
    { id: 6, title: 'Marketing Strategy', date: new Date(2025, 11, 13), time: '10am', color: 'bg-green-200' },
    { id: 7, title: 'Annual Shareholders Meeting', date: new Date(2025, 11, 21), time: '', color: 'bg-teal-200' },
  ]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const addEvent = (event) => {
    setEvents([...events, { ...event, id: Date.now() }]);
  };

  const getEventsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => calendarService.isSameDay(event.date, date));
  };

  return {
    currentDate,
    view,
    setView,
    events,
    nextMonth,
    prevMonth,
    goToToday,
    addEvent,
    getEventsForDay
  };
};