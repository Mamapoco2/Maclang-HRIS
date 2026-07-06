// src/services/profileService.js
import api from "@/api/api";

const getStatus = async () => {
  try {
    const res = await api.get("/profile/status");
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message ?? "Failed to fetch profile status.",
    };
  }
};

const complete = async (formData) => {
  try {
    const res = await api.post("/profile/complete", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: res.data };
  } catch (err) {
    if (err.response?.status === 422) {
      // console.log("422 errors:", err.response.data);
      return {
        success: false,
        validationErrors: err.response.data?.errors ?? {},
      };
    }
    return {
      success: false,
      error: err.response?.data?.message ?? "Failed to save profile.",
    };
  }
};

export default { getStatus, complete };
