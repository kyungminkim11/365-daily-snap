import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function optimizeRecentFramePriority() {
  const target = "eager={index < frames.length}";
  return {
    name: "optimize-recent-frame-priority",
    enforce: "pre",
    transform(code, id) {
      if (!id.replaceAll("\\", "/").endsWith("/src/App.jsx") || !code.includes(target)) return null;
      return {
        code: code.replace(target, "eager={index === 0}"),
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [optimizeRecentFramePriority(), react()],
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
