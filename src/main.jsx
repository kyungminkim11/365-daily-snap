import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import InstagramQuickLink from "./InstagramQuickLink.jsx";
import MultiLanguage from "./MultiLanguage.jsx";
import "./index.css";
import "./ux-refresh.css";
import "./responsive-fix.css";
import "./content-source-fix.css";
import "./multi-language.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <InstagramQuickLink />
    <MultiLanguage />
  </React.StrictMode>,
);
