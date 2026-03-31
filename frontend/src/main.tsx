import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

const appLoader = document.getElementById("app-loader");
if (appLoader) {
  appLoader.classList.add("hidden");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
