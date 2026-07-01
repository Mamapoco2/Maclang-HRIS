import api from "@/api/api";

export const contractService = {
  async getAll() {
    const res = await api.get("/hiring/contracts");
    return res.data;
  },

  async create(payload) {
    const res = await api.post("/hiring/contracts", payload);
    return res.data;
  },

  async update(contractId, payload) {
    const res = await api.put(`/hiring/contracts/${contractId}`, payload);
    return res.data;
  },

  async delete(contractId) {
    const res = await api.delete(`/hiring/contracts/${contractId}`);
    return res.data;
  },

  async updateAutoRenewal(contractId, payload) {
    const res = await api.patch(
      `/hiring/contracts/${contractId}/auto-renewal`,
      payload,
    );
    return res.data?.data ?? res.data;
  },

  async manualRenew(contractId) {
    const res = await api.post(`/hiring/contracts/${contractId}/manual-renew`);
    return res.data?.data ?? res.data;
  },
};
