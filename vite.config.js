import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": "http://localhost:5174",
    },
  },
});
