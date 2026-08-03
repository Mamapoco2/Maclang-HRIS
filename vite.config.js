import fs from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const certPath = "C:/Users/colin/Desktop/MACLANG DEPT/cert.pem";
const keyPath = "C:/Users/colin/Desktop/MACLANG DEPT/key.pem";
const hasCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

export default defineConfig({
  darkMode: "class",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0",
    https: hasCert
      ? {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        }
      : true,
  },
});
