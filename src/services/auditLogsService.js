import api from "@/api/api";

export const auditLogsService = {
  async getAuditLogs(params = {}) {
    const res = await api.get("/audit-logs", { params });
    return res.data;
  },
};
