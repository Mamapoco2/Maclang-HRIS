import api from "@/api/api";

/**
 * Get holidays for current year and next year
 * Automatically updates every next year (runs at midnight on Jan 1st)
 */
export const getHolidaysWithAutoUpdate = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const currentResponse = await api.get(`/holidays/${currentYear}`);
    const nextResponse = await api.get(`/holidays/${nextYear}`);

    return {
      success: true,
      currentYear,
      nextYear,
      [currentYear]: currentResponse.data.holidays,
      [nextYear]: nextResponse.data.holidays,
    };
  } catch (error) {
    console.error(
      "Error fetching holidays:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Initialize auto-update that runs every year at midnight (Jan 1st)
 * Automatically pulls new year holidays when year changes
 */
export const initializeAutoYearlyUpdate = (callback) => {
  // Function to update holidays
  const updateHolidays = async () => {
    try {
      const holidays = await getHolidaysWithAutoUpdate();

      if (callback) {
        callback(holidays);
      }

      return holidays;
    } catch (error) {
      console.error("Failed to update holidays:", error);
    }
  };

  // Get milliseconds until next January 1st at midnight
  const getTimeUntilNextYear = () => {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    return nextYear.getTime() - now.getTime();
  };

  // Update immediately on load
  updateHolidays();

  // Set timeout for next year (Jan 1st at midnight)
  let timeoutId = setTimeout(() => {
    updateHolidays();

    // Then repeat every year (365 days)
    setInterval(updateHolidays, 365 * 24 * 60 * 60 * 1000);
  }, getTimeUntilNextYear());

  // Return function to clear the timeout if needed
  return () => clearTimeout(timeoutId);
};
