import api from "@/api/api";
import {
  buildUserListParams,
  normalizeUserListResponse,
} from "@/utils/userManagement";

/**
 * Server-side paginated, filterable list of approved users.
 *
 * Errors are intentionally NOT swallowed here (unlike the legacy
 * getApprovedUsers): the caller must be able to tell "no users" apart
 * from "request failed" (403, network, 5xx).
 */
export async function fetchUsers(query, { signal } = {}) {
  const res = await api.get("/users", {
    params: buildUserListParams(query),
    signal,
  });

  return normalizeUserListResponse(res.data);
}
