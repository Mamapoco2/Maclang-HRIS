import { useEffect } from "react";

/**
 * @param {Object}   options
 * @param {Function} options.onNotification  - called with the broadcast payload
 * @param {Function} [options.onRefreshBell] - optional: call to re-fetch unread count
 *
 * Usage:
 *   useTrainingNotifications({
 *     onNotification: (data) => toast.success(data.message),
 *     onRefreshBell:  fetchUnreadCount,
 *   });
 */
export function useTrainingNotifications({ onNotification, onRefreshBell }) {
  useEffect(() => {
    if (!window.Echo) {
      console.warn("Laravel Echo is not initialised.");
      return;
    }

    const channel = window.Echo.channel("notifications");

    channel.listen(".training.created", (payload) => {
      if (typeof onNotification === "function") {
        onNotification(payload);
      }

      if (typeof onRefreshBell === "function") {
        onRefreshBell();
      }
    });

    return () => {
      window.Echo.leaveChannel("notifications");
    };
  }, []);
}
