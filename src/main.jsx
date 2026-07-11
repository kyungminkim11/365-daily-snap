import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function SkipLink() {
  const language = window.location.pathname.split("/").filter(Boolean)[0];
  const label = language === "ja" ? "本文へ移動" : language === "en" ? "Skip to content" : "본문으로 바로가기";

  const moveToContent = (event) => {
    event.preventDefault();
    const main = document.querySelector("main");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: "auto", block: "start" });
  };

  return <a className="skip-link" href="#main-content" onClick={moveToContent}>{label}</a>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SkipLink />
    <App />
  </React.StrictMode>,
);
