import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import "./index.css";

const appLoader = document.getElementById("app-loader");
if (appLoader) {
  appLoader.classList.add("hidden");
}

registerSW({
  onNeedRefresh() {
    console.log("New content is available and will be used when all tabs are closed.");
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
