// src/lib/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  //   console.log("getEcho called, key:", "wkovqmavktiku4lgolmh");

  if (!echoInstance) {
    // console.log("Creating new Echo instance...");
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: "wkovqmavktiku4lgolmh",
      wsHost: "localhost",
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ["ws", "wss"],
    });

    // echoInstance.connector.pusher.connection.bind("connected", () => {
    //   console.log("✅ WebSocket CONNECTED");
    // });

    // echoInstance.connector.pusher.connection.bind("disconnected", () => {
    //   console.log("❌ WebSocket DISCONNECTED");
    // });

    // echoInstance.connector.pusher.connection.bind("error", (err) => {
    //   console.log("❌ WebSocket ERROR:", err);
    // });
  }

  return echoInstance;
}

export default getEcho;
