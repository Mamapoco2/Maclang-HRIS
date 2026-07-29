import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "@/lib/tokenStorage";

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho({ forceNew = false } = {}) {
  if (echoInstance && !forceNew) {
    return echoInstance;
  }

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  const token = getToken();
  if (!token) return null;

  const useTLS = import.meta.env.VITE_REVERB_SCHEME === "https";

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: useTLS,
    enabledTransports: useTLS ? ["wss"] : ["ws"],
    disableStats: true,
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return echoInstance;
}

export function resetEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export default getEcho;
