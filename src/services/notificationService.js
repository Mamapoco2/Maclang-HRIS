import api from "@/api/api";

const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

const getUnreadCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data.count;
};

const markRead = async (id) => {
  const res = await api.post(`/notifications/${id}/mark-read`);
  return res.data;
};

const markAllRead = async () => {
  const res = await api.post("/notifications/mark-all-read");
  return res.data;
};

export default { getNotifications, getUnreadCount, markRead, markAllRead };
