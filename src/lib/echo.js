import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "@/lib/tokenStorage";

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: "wkovqmavktiku4lgolmh",
      wsHost: "localhost",
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ["ws", "wss"],
      authEndpoint: "http://localhost:8000/api/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    });
  }

  return echoInstance;
}

export function resetEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export default getEcho;
