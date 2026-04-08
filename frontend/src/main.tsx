import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import "./index.css";

const appLoader = document.getElementById("app-loader");
if (appLoader) {
  appLoader.classList.add("hidden");
}

// Only check for updates once per 10 minutes to avoid aggressive refresh loops
let lastUpdateCheck = 0;
const UPDATE_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content is available. Refresh to update.");
    // Don't auto-refresh - let user decide or wait for natural page reload
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
  },
  // Only check for updates periodically to prevent infinite loops
  immediate: false,
});

// Manual periodic update check (less aggressive than Vite default)
if (navigator.serviceWorker) {
  setInterval(() => {
    const now = Date.now();
    if (now - lastUpdateCheck >= UPDATE_CHECK_INTERVAL) {
      lastUpdateCheck = now;
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().catch(() => {});
        }
      });
    }
  }, 60000); // Check every minute if interval has passed
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
