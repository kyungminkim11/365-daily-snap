import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import InstagramQuickLink from "./InstagramQuickLink.jsx";
import "./index.css";
import "./ux-refresh.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <InstagramQuickLink />
  </React.StrictMode>,
);
