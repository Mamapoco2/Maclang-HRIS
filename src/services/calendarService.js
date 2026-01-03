export const calendarService = {
  getDaysInMonth: (year, month) => new Date(year, month + 1, 0).getDate(),
  getFirstDayOfMonth: (year, month) => new Date(year, month, 1).getDay(),
  formatDate: (date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),

  getDateString: (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  },

  isSameDay: (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  },
};
