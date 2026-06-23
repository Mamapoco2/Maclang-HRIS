import api from "@/api/api";

/**
 * Fetch paginated published releases.
 * GET /releases (public — no auth required)
 */
export async function fetchReleases({ page = 1, perPage = 15 } = {}) {
  const res = await api.get("/releases", {
    params: { page, per_page: perPage },
  });
  return res.data; // { data: Release[], meta: { current_page, last_page, per_page, total } }
}

/**
 * Fetch a single published release by ID.
 * GET /releases/:id (public)
 */
export async function fetchRelease(id) {
  const res = await api.get(`/releases/${id}`);
  return res.data; // { data: Release }
}

/**
 * Fetch resolved reports not yet assigned to any release.
 * GET /reports/resolved/unassigned (auth required)
 */
export async function fetchUnassignedReports() {
  const res = await api.get("/reports/resolved/unassigned");
  return res.data; // { data: UnassignedReport[] }
}

/**
 * Create and publish a new release.
 * POST /releases (auth required)
 *
 * @param {{ version: string, title?: string, date?: string, report_ids: number[] }} payload
 */
export async function createRelease(payload) {
  const res = await api.post("/releases", payload);
  return res.data; // { message: string, data: Release }
}

/**
 * Delete a release (detaches all associated reports).
 * DELETE /releases/:id (auth required)
 */
export async function deleteRelease(id) {
  const res = await api.delete(`/releases/${id}`);
  return res.data; // { message: string }
}
