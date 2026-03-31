import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

const BACKEND_TARGET = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "logo.png", "logo-dark.png", "manifest.json", "icons/icon-192.svg", "icons/icon-512.svg"],
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
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@core": path.resolve(__dirname, "./src/core"),
            "@features": path.resolve(__dirname, "./src/features"),
            "@shared": path.resolve(__dirname, "./src/shared"),
            "@styles": path.resolve(__dirname, "./src/styles"),
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
});
