import api from "@/api/api";

export const AccountApi = {
  // ─── Profile ─────────────────────────────────────────────────────
  async updateProfile({ contactNumber }) {
    const res = await api.put("/account/profile", {
      contact_number: contactNumber,
    });
    return res.data;
  },

  // ─── Signatures ─────────────────────────────────────────────────────
  async getSignatures() {
    const res = await api.get("/account/signatures");
    return res.data?.data ?? { primary: null, countersign: null };
  },

  async uploadSignature(type, file) {
    const formData = new FormData();
    formData.append("signature", file);

    const res = await api.post(`/account/signatures/${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  },

  async deleteSignature(type) {
    const res = await api.delete(`/account/signatures/${type}`);
    return res.data;
  },

  async getSignaturePreviewUrl(type) {
    const res = await api.get(`/account/signatures/${type}/preview`, {
      responseType: "blob",
    });
    return URL.createObjectURL(res.data);
  },

  // ─── Activity log ─────────────────────────────────────────────────────
  async getActivityLog(limit = 20) {
    const res = await api.get("/account/activity", { params: { limit } });
    return res.data?.data ?? [];
  },
};
