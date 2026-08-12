import api from "@/api/api";

export async function getRecentLeaves(limit = 5) {
  const res = await api.get("/leave/dashboard/recent", { params: { limit } });
  return res.data?.data ?? [];
}
