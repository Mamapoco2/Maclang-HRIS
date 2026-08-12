import api from "@/api/api";

export const LeaveApi = {
  // ─── Leave Types ─────────────────────────────────────────────────────
  listTypes(params) {
    return api.get("/leave/types", { params }).then((r) => r.data.data);
  },

  // ─── Requests ─────────────────────────────────────────────────────
  listRequests(params) {
    return api.get("/leave/requests", { params }).then((r) => r.data);
  },
  getRequest(id) {
    return api.get(`/leave/requests/${id}`).then((r) => r.data.data);
  },

  submitRequest(fields, files = {}, multiFiles = []) {
    const formData = new FormData();

    // Fields whose value must be serialized as Laravel's "boolean" rule
    // expects on a multipart/form-data request: '1' / '0', NOT the
    // JS-stringified "true" / "false" (which Laravel's boolean rule
    // rejects outright, even though it looks like a valid boolean).
    const BOOLEAN_FIELDS = new Set(["is_half_day"]);

    Object.entries(fields).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;

      if (BOOLEAN_FIELDS.has(key)) {
        formData.append(key, value ? "1" : "0");
        return;
      }

      if (key === "details" && typeof value === "object") {
        Object.entries(value).forEach(([dKey, dValue]) => {
          if (dValue === undefined || dValue === null || dValue === "") return;
          formData.append(`details[${dKey}]`, dValue);
        });
        return;
      }
      formData.append(key, value);
    });

    let fileIndex = 0;
    Object.entries(files).forEach(([requirementKey, file]) => {
      if (!file) return;
      formData.append(`documents[${fileIndex}]`, file);
      formData.append(`document_keys[${fileIndex}]`, requirementKey);
      fileIndex += 1;
    });
    multiFiles.forEach((file) => {
      formData.append(`documents[${fileIndex}]`, file);
      formData.append(`document_keys[${fileIndex}]`, "vawc_documents");
      fileIndex += 1;
    });

    return api
      .post("/leave/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  cancelRequest(id, reason) {
    return api
      .post(`/leave/requests/${id}/cancel`, { reason })
      .then((r) => r.data);
  },
  async downloadDocument(requestId, documentId, filename) {
    const res = await api.get(
      `/leave/requests/${requestId}/documents/${documentId}/download`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // ─── Approvals ─────────────────────────────────────────────────────
  listPendingApprovals(params) {
    return api.get("/leave/approvals/pending", { params }).then((r) => r.data);
  },
  listRecentDecisions(params) {
    return api
      .get("/leave/approvals/recent-decisions", { params })
      .then((r) => r.data.data);
  },
  act(requestId, action, remarks) {
    return api
      .post(`/leave/approvals/${requestId}/act`, { action, remarks })
      .then((r) => r.data);
  },
  bulkApprove(leaveRequestIds) {
    return api
      .post("/leave/approvals/bulk-approve", {
        leave_request_ids: leaveRequestIds,
      })
      .then((r) => r.data);
  },

  // ─── Balances ─────────────────────────────────────────────────────
  getMyBalances(employeeId, year) {
    return api
      .get(`/leave/employees/${employeeId}/balances`, { params: { year } })
      .then((r) => r.data.data);
  },
  listAllBalances(params) {
    return api.get("/leave/balances", { params }).then((r) => r.data);
  },
  adjustBalance(payload) {
    return api.post("/leave/balances/adjust", payload).then((r) => r.data);
  },
  setCredits(
    employeeId,
    leaveTypeId,
    year,
    { total, used, carryForward, remarks },
  ) {
    return api
      .post(`/leave/employees/${employeeId}/balances/${leaveTypeId}/credits`, {
        year,
        total,
        used,
        carry_forward: carryForward,
        remarks,
      })
      .then((r) => r.data.data);
  },
  resetCredits(employeeId, leaveTypeId, year) {
    return api
      .delete(
        `/leave/employees/${employeeId}/balances/${leaveTypeId}/credits`,
        {
          params: { year },
        },
      )
      .then((r) => r.data.data);
  },

  // ─── Calendar ─────────────────────────────────────────────────────
  getCalendar(from, to) {
    return api
      .get("/leave/calendar", { params: { from, to } })
      .then((r) => r.data.data.leaves);
  },

  // ─── Holidays (HR-managed calendar holidays, NOT the PH public-holiday lookup) ─────
  listHolidays(year) {
    return api
      .get("/leave/holidays", { params: { year } })
      .then((r) => r.data.data);
  },
  createHoliday(payload) {
    return api.post("/leave/holidays", payload).then((r) => r.data);
  },
  updateHoliday(id, payload) {
    return api.put(`/leave/holidays/${id}`, payload).then((r) => r.data);
  },
  deleteHoliday(id) {
    return api.delete(`/leave/holidays/${id}`).then((r) => r.data);
  },

  // ─── Dashboard ─────────────────────────────────────────────────────
  getPersonalDashboard(year) {
    return api
      .get("/leave/dashboard/personal", { params: { year } })
      .then((r) => r.data.data);
  },
  getOverviewDashboard(year) {
    return api
      .get("/leave/dashboard/overview", { params: { year } })
      .then((r) => r.data.data);
  },
  getActivityFeed(limit) {
    return api
      .get("/leave/dashboard/activity", { params: { limit } })
      .then((r) => r.data.data);
  },
};

export default LeaveApi;
