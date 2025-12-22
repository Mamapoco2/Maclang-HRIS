export function calculateLeaveBalance({
  appointmentDate,
  currentDate = new Date(),
  usedVL = 0,
  usedSL = 0,
}) {
  const start = new Date(appointmentDate);
  const end = new Date(currentDate);

  const monthsWorked =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const earnedVL = monthsWorked * 1.25;
  const earnedSL = monthsWorked * 1.25;

  return {
    vl: Math.max(0, earnedVL - usedVL),
    sl: Math.max(0, earnedSL - usedSL),
  };
}
