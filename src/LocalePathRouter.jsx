import { useEffect } from "react";

const LANGUAGE_PATHS = {
  ko: "/ko",
  ja: "/ja",
  en: "/en",
};

const SHORT_LABEL_TO_LANGUAGE = {
  KO: "ko",
  JP: "ja",
  EN: "en",
};

function getLanguageFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return ["ko", "ja", "en"].includes(segment) ? segment : "ko";
}

function getPathForLanguage(language) {
  return LANGUAGE_PATHS[language] || LANGUAGE_PATHS.ko;
}

export default function LocalePathRouter() {
  if (typeof window !== "undefined") {
    const languageFromPath = getLanguageFromPath(window.location.pathname);
    window.localStorage.setItem("site-language", languageFromPath);
    document.documentElement.dataset.siteLanguage = languageFromPath;
  }

  useEffect(() => {
    const syncPath = (language) => {
      const nextPath = getPathForLanguage(language);
      const currentPath = window.location.pathname;

      window.localStorage.setItem("site-language", language);
      document.documentElement.dataset.siteLanguage = language;

      if (currentPath !== nextPath) {
        window.history.pushState({}, "", nextPath);
      }
    };

    const handleLanguageClick = (event) => {
      const button = event.target.closest?.(".language-switcher button");
      if (!button) {
        return;
      }

      const language = SHORT_LABEL_TO_LANGUAGE[button.textContent.trim().toUpperCase()];
      if (language) {
        syncPath(language);
      }
    };

    const handlePopState = () => {
      const language = getLanguageFromPath(window.location.pathname);
      window.localStorage.setItem("site-language", language);
      document.documentElement.dataset.siteLanguage = language;
      window.location.reload();
    };

    document.addEventListener("click", handleLanguageClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLanguageClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
