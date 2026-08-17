import { useEffect } from "react";
import { getEcho } from "@/lib/echo";

export function useTrainingNotifications({ onNotification, onRefreshBell }) {
  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private("notifications");

    const handler = (payload) => {
      if (typeof onNotification === "function") {
        onNotification(payload);
      }

      if (typeof onRefreshBell === "function") {
        onRefreshBell();
      }
    };

    channel.listen(".training.created", handler);

    return () => {
      channel.stopListening(".training.created", handler);
    };
  }, []);
}
