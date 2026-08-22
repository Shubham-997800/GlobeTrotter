import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
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
      // Dev-only: forwards /api/* to the Express backend.
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});