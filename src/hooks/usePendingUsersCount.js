import { useEffect, useState } from "react";
import { getPendingCount } from "@/services/accountsService";
import getEcho from "@/lib/echo";

export function usePendingUsersCount() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const c = await getPendingCount();
      setCount(c);
    } catch {}
  };

  useEffect(() => {
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
    };
  }, []);

  return count;
}
