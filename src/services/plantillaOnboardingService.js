import api from "@/api/api";

export async function getOnboardingSummary() {
  try {
    const res = await api.get("/plantilla-onboarding/summary");
    return res.data;
  } catch (err) {
    console.error("getOnboardingSummary:", err);
    return { new_hires: 0, in_progress: 0, completed: 0, pending_tasks: 0 };
  }
}

export async function getOnboardings(params = {}) {
  try {
    const res = await api.get("/plantilla-onboarding", { params });
    return res.data;
  } catch (err) {
    console.error("getOnboardings:", err);
    return { data: [], pagination: {} };
  }
}

export async function updateOnboarding(id, data) {
  const res = await api.put(`/plantilla-onboarding/${id}`, data);
  return res.data;
}

export async function deleteOnboarding(id) {
  const res = await api.delete(`/plantilla-onboarding/${id}`);
  return res.data;
}

export async function toggleTask(onboardingId, taskId) {
  const res = await api.patch(
    `/plantilla-onboarding/${onboardingId}/tasks/${taskId}/toggle`,
  );
  return res.data;
}

export async function addTask(onboardingId, title) {
  const res = await api.post(`/plantilla-onboarding/${onboardingId}/tasks`, {
    title,
  });
  return res.data;
}

export async function updateTask(onboardingId, taskId, title) {
  const res = await api.put(
    `/plantilla-onboarding/${onboardingId}/tasks/${taskId}`,
    { title },
  );
  return res.data;
}

export async function deleteTask(onboardingId, taskId) {
  const res = await api.delete(
    `/plantilla-onboarding/${onboardingId}/tasks/${taskId}`,
  );
  return res.data;
}
