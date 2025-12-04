export const calendarService = {
  getDaysInMonth: (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  },

  getFirstDayOfMonth: (year, month) => {
    return new Date(year, month, 1).getDay();
  },

  formatDate: (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  },

  isSameDay: (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  },
};
