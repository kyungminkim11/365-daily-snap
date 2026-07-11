import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import SiteExperience, { SiteErrorBoundary } from "./SiteExperience.jsx";
import { installAnalyticsTransport } from "./analyticsTransport.js";
import "./index.css";

installAnalyticsTransport();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteErrorBoundary>
      <SiteExperience>
        <App />
      </SiteExperience>
    </SiteErrorBoundary>
  </React.StrictMode>,
);
