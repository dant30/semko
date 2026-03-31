import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND_TARGET = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default defineConfig(({ mode }) => {
  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  const isProd = mode === "production";
  const isAnalyze = mode === "analyze";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "logo.png",
          "logo-dark.png",
          "manifest.json",
          "icons/icon-192.svg",
          "icons/icon-512.svg",
        ],
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
      isAnalyze &&
        visualizer({
          open: true,
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
        "@core": path.resolve(rootDir, "./src/core"),
        "@features": path.resolve(rootDir, "./src/features"),
        "@shared": path.resolve(rootDir, "./src/shared"),
        "@styles": path.resolve(rootDir, "./src/styles"),
        "@api": path.resolve(rootDir, "./src/core/api"),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        "/api": {
          target: BACKEND_TARGET,
          changeOrigin: true,
          secure: false,
        },
        "/media": {
          target: BACKEND_TARGET,
          changeOrigin: true,
          secure: false,
        },
        "/static": {
          target: BACKEND_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      port: 3000,
    },
    build: {
      sourcemap: !isProd,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, "/");

            if (normalizedId.includes("/node_modules/")) {
              if (
                normalizedId.includes("/react/") ||
                normalizedId.includes("/react-dom/") ||
                normalizedId.includes("/react-router-dom/") ||
                normalizedId.includes("/react-error-overlay/")
              ) {
                return "react-vendor";
              }
              if (
                normalizedId.includes("/recharts/") ||
                normalizedId.includes("/d3-") ||
                normalizedId.includes("/chart.js/")
              ) {
                return "charts";
              }
              if (
                normalizedId.includes("/axios/") ||
                normalizedId.includes("/date-fns/") ||
                normalizedId.includes("/lucide-react/") ||
                normalizedId.includes("/clsx/") ||
                normalizedId.includes("/tailwind-merge/")
              ) {
                return "vendor";
              }
            }

            if (normalizedId.includes("/src/features/dashboard/")) {
              return "feature-dashboard";
            }
            if (normalizedId.includes("/src/features/stores/")) {
              return "feature-stores";
            }
            if (normalizedId.includes("/src/features/fuel/")) {
              return "feature-fuel";
            }
            if (normalizedId.includes("/src/features/maintenance/")) {
              return "feature-maintenance";
            }
            if (normalizedId.includes("/src/features/payroll/")) {
              return "feature-payroll";
            }
            if (normalizedId.includes("/src/features/notifications/")) {
              return "feature-notifications";
            }
            if (normalizedId.includes("/src/features/auth/")) {
              return "feature-auth";
            }
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp)$/i.test(name ?? "")) {
              return "assets/images/[name]-[hash][extname]";
            }
            if (/\.css$/i.test(name ?? "")) {
              return "assets/css/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
      chunkSizeWarningLimit: 900,
    },
  };
});
