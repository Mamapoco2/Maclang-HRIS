import { useCallback, useEffect, useState } from "react";
import { getPendingCount } from "@/services/accountsService";
import { useAuth } from "@/hooks/useAuth";
import getEcho from "@/lib/echo";

const REQUIRED_PERMISSION = "users.manage";
const BYPASS_ROLE = "SuperAdmin";

export function usePendingUsersCount() {
  const { user, loading, hasPermission, hasRole } = useAuth();
  const [count, setCount] = useState(0);

  const canViewPendingUsers =
    !loading &&
    !!user &&
    (hasPermission(REQUIRED_PERMISSION) || hasRole(BYPASS_ROLE));

  const fetchCount = useCallback(async () => {
    if (!canViewPendingUsers) return;

    const c = await getPendingCount();
    setCount(c);
  }, [canViewPendingUsers]);

  useEffect(() => {
    if (!canViewPendingUsers) {
      setCount(0);
      return;
    }

    fetchCount();

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private("pending-users");

    const onRegistered = () => fetchCount();
    const onActivated = () => fetchCount();

    channel.listen(".user.registered", onRegistered);
    channel.listen(".user.activated", onActivated);

    return () => {
      channel.stopListening(".user.registered", onRegistered);
      channel.stopListening(".user.activated", onActivated);
      echo.leave("pending-users");
    };
  }, [canViewPendingUsers, fetchCount]);

  return count;
}
