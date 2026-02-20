import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  envDir: "..",
  plugins: [react()],

  // Build optimizations
  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "animation-vendor": ["framer-motion"],
          "ui-vendor": ["lucide-react"],
          "query-vendor": ["@tanstack/react-query"],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Source maps (disable in production for smaller size)
    sourcemap: false,
  },

  // Performance optimizations
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "axios",
      "@tanstack/react-query",
    ],
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
