/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libs so app code updates don't bust their cache.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("@radix-ui") || id.includes("react-aria"))
              return "vendor-radix";
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("react-router") ||
              id.includes("scheduler")
            )
              return "vendor-react";
            if (id.includes("zod") || id.includes("react-hook-form") || id.includes("@hookform"))
              return "vendor-forms";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      // Forwards /api/* to the deployed API by default so a fresh clone
      // works without running the backend locally. To develop against a
      // local backend instead, set VITE_API_PROXY_TARGET=http://localhost:4000.
      // After deploying on Render, replace the host below with your real
      // service URL (e.g. https://globetrotter-api-xxxx.onrender.com).
      "/api": {
        target:
          process.env.VITE_API_PROXY_TARGET ??
          "https://globetrotter-b769.onrender.com",
        changeOrigin: true,
        secure: true,
        timeout: 60_000,
        proxyTimeout: 60_000,
      },
    },
  },
});