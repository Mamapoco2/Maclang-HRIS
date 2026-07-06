// src/hooks/usePendingUsersCount.js
import { useEffect, useState } from "react";
import { getPendingCount } from "@/services/accountsService";
import getEcho from "@/lib/echo";

export function usePendingUsersCount() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const c = await getPendingUserCount();
      setCount(c);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchCount();

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel("pending-users");

    // New registration — count goes UP
    channel.listen(".user.registered", () => {
      // console.log("👤 user.registered received — refreshing count");
      fetchCount();
    });

    // User activated — count goes DOWN
    channel.listen(".user.activated", () => {
      // console.log("👤 user.registered received — refreshing count");
      fetchCount();
    });

    return () => {
      echo.leaveChannel("pending-users");
    };
  }, []);

  return count;
}
