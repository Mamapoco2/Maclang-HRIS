import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/authContext";
import { Toaster } from "sonner";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";

// TEMPORARY DEBUG
window.addEventListener("error", (e) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px;white-space:pre-wrap">${e.message}\n${e.error?.stack}</pre>`;
});
window.addEventListener("unhandledrejection", (e) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px;white-space:pre-wrap">${e.reason?.message}\n${e.reason?.stack}</pre>`;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
