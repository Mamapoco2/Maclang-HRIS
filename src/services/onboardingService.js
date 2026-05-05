import api from "@/api/api";

export async function getOnboardingSummary() {
  try {
    const res = await api.get("/onboarding/summary");
    return res.data;
  } catch (err) {
    console.error("getOnboardingSummary:", err);
    return { new_hires: 0, in_progress: 0, completed: 0, pending_tasks: 0 };
  }
}

export async function getOnboardings(params = {}) {
  try {
    const res = await api.get("/onboarding", { params });
    return res.data;
  } catch (err) {
    console.error("getOnboardings:", err);
    return { data: [], pagination: {} };
  }
}

export async function createOnboarding(data) {
  const res = await api.post("/onboarding", data);
  return res.data;
}

export async function updateOnboarding(id, data) {
  const res = await api.put(`/onboarding/${id}`, data);
  return res.data;
}

export async function deleteOnboarding(id) {
  const res = await api.delete(`/onboarding/${id}`);
  return res.data;
}

export async function toggleTask(onboardingId, taskId) {
  const res = await api.patch(
    `/onboarding/${onboardingId}/tasks/${taskId}/toggle`,
  );
  return res.data;
}

export async function addTask(onboardingId, title) {
  const res = await api.post(`/onboarding/${onboardingId}/tasks`, { title });
  return res.data;
}

// NEW: Edit task title in-place
export async function updateTask(onboardingId, taskId, title) {
  const res = await api.put(`/onboarding/${onboardingId}/tasks/${taskId}`, {
    title,
  });
  return res.data;
}

export async function deleteTask(onboardingId, taskId) {
  const res = await api.delete(`/onboarding/${onboardingId}/tasks/${taskId}`);
  return res.data;
}
