import api from "@/api/api";

export const getDtrAuditLogs = async ({
  scope,
  action,
  q,
  from,
  to,
  page,
  perPage,
} = {}) => {
  const { data } = await api.get("/dtr/audit-logs", {
    params: {
      ...(scope && { scope }),
      ...(action && { action }),
      ...(q && { q }),
      ...(from && { from }),
      ...(to && { to }),
      ...(page && { page }),
      ...(perPage && { per_page: perPage }),
    },
  });

  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    currentPage: data?.current_page ?? 1,
    lastPage: data?.last_page ?? 1,
    total: data?.total ?? 0,
  };
};