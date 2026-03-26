import api from "../api/api";

// Get count of plantilla employees
export const getManpowerSummary = async () => {
  try {
    const res = await api.get("/manpower/summary");
    return res.data;
  } catch (error) {
    console.error("Error fetching manpower summary:", error);
    throw error;
  }
};

// Get organizational chart data
const getManPowertData = async () => {
  const res = await api.get("/manpower/tree");
  return res.data.nodes;
};

export default {
  getManpowerSummary,
  getManPowertData,
};
