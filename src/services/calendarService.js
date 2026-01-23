export const calendarService = {
  getDaysInMonth: (y, m) => new Date(y, m + 1, 0).getDate(),
  getFirstDayOfMonth: (y, m) => new Date(y, m, 1).getDay(),
  getDateString: (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`,
  isSameDay: (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate(),
  formatDate: (date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
};
