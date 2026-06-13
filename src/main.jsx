import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import InstagramQuickLink from "./InstagramQuickLink.jsx";
import LocalePathRouter from "./LocalePathRouter.jsx";
import MultiLanguage from "./MultiLanguage.jsx";
import LocaleNoHangulGuard from "./LocaleNoHangulGuard.jsx";
import BookingConversionBoost from "./BookingConversionBoost.jsx";
import GrowthSections from "./GrowthSections.jsx";
import PerformanceHints from "./PerformanceHints.jsx";
import MotionExperience from "./MotionExperience.jsx";
import "./index.css";
import "./ux-refresh.css";
import "./responsive-fix.css";
import "./content-source-fix.css";
import "./multi-language.css";
import "./growth-sections.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LocalePathRouter />
    <MotionExperience />
    <App />
    <BookingConversionBoost />
    <GrowthSections />
    <InstagramQuickLink />
    <MultiLanguage />
    <LocaleNoHangulGuard />
    <PerformanceHints />
  </React.StrictMode>,
);
