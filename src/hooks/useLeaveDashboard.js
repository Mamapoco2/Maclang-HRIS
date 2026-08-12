import { useEffect, useState } from "react";
import { LeaveApi } from "@/services/leaveApiService";
import { useAuth } from "@/hooks/useAuth";

export function useLeaveDashboard() {
  const { hasPermission } = useAuth();
  const canViewOrgWide = hasPermission("leave.dashboard.view");

  const [personal, setPersonal] = useState(null);
  const [overview, setOverview] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const requests = [LeaveApi.getPersonalDashboard()];
    if (canViewOrgWide) {
      requests.push(LeaveApi.getOverviewDashboard());
      requests.push(LeaveApi.getActivityFeed(10));
    }

    Promise.all(requests)
      .then(([personalData, overviewData, activityData]) => {
        if (cancelled) return;
        setPersonal(personalData);
        if (overviewData) setOverview(overviewData);
        if (activityData) setActivity(activityData);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canViewOrgWide]);

  return { personal, overview, activity, loading, error, canViewOrgWide };
}
