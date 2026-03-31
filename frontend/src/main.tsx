import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

const appLoader = document.getElementById("app-loader");
if (appLoader) {
  appLoader.classList.add("hidden");
}

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.error("SW registration failed:", error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
