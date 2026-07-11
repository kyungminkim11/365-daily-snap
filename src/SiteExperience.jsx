import { Component, useEffect, useMemo, useState } from "react";
import { ArrowUp, RefreshCw, WifiOff } from "lucide-react";

const SECTION_IDS = ["work", "sessions", "prepare", "reviews", "about", "faq", "contact"];

const UI_COPY = {
  ko: {
    skip: "본문 바로가기",
    backToTop: "맨 위로 이동",
    offline: "현재 오프라인 상태입니다. 이미 불러온 내용은 계속 볼 수 있습니다.",
    errorTitle: "페이지를 표시하는 중 문제가 발생했습니다.",
    errorText: "새로고침하면 대부분 정상적으로 복구됩니다.",
    reload: "새로고침",
    home: "홈으로 이동",
    nav: "주요 메뉴",
    menu: "메뉴 열기 또는 닫기",
    featured: "대표 사진",
    related: "비슷한 작업도 함께 보기",
    controller: "개인정보 처리자",
    contact: "연락처",
    address: "사업장 주소",
    imageFallback: "이미지를 불러오지 못했습니다.",
  },
  en: {
    skip: "Skip to content",
    backToTop: "Back to top",
    offline: "You are offline. Previously loaded content remains available.",
    errorTitle: "Something went wrong while displaying this page.",
    errorText: "Refreshing the page usually restores it.",
    reload: "Refresh",
    home: "Go home",
    nav: "Primary navigation",
    menu: "Open or close menu",
    featured: "Featured photography",
    related: "Explore similar projects",
    controller: "Data controller",
    contact: "Contact",
    address: "Business address",
    imageFallback: "The image could not be loaded.",
  },
  ja: {
    skip: "本文へ移動",
    backToTop: "ページ上部へ",
    offline: "オフラインです。読み込み済みの内容は引き続きご覧いただけます。",
    errorTitle: "ページの表示中に問題が発生しました。",
    errorText: "再読み込みすると復旧する場合があります。",
    reload: "再読み込み",
    home: "ホームへ",
    nav: "メインメニュー",
    menu: "メニューを開閉",
    featured: "代表写真",
    related: "関連する作品を見る",
    controller: "個人情報取扱者",
    contact: "連絡先",
    address: "事業所所在地",
    imageFallback: "画像を読み込めませんでした。",
  },
};

function languageFromPath() {
  const language = window.location.pathname.split("/").filter(Boolean)[0];
  return UI_COPY[language] ? language : "ko";
}

function patchStaticAccessibility(copy) {
  const main = document.querySelector("main");
  if (main) {
    main.id = "main-content";
    main.tabIndex = -1;
  }

  const brand = document.querySelector(".brand");
  if (brand) brand.setAttribute("aria-label", "365 Daily Snap home");

  const navigation = document.querySelector(".site-header nav");
  if (navigation) navigation.setAttribute("aria-label", copy.nav);

  const menu = document.querySelector(".menu-button");
  if (menu) menu.setAttribute("aria-label", copy.menu);

  const heroCollage = document.querySelector(".hero-collage");
  if (heroCollage) heroCollage.setAttribute("aria-label", copy.featured);

  const related = document.querySelector(".related-projects .section-heading h2");
  if (related) related.textContent = copy.related;

  const privacyLabels = document.querySelectorAll(".privacy-modal dl dt");
  [copy.controller, copy.contact, copy.address].forEach((label, index) => {
    if (privacyLabels[index]) privacyLabels[index].textContent = label;
  });

  document.querySelectorAll(".faq-list article").forEach((article) => {
    const button = article.querySelector(":scope > button");
    if (button) button.setAttribute("aria-expanded", article.classList.contains("open") ? "true" : "false");
  });

  document.querySelectorAll(".modal-close").forEach((button) => {
    if (!button.getAttribute("aria-label")) button.setAttribute("aria-label", copy.menu);
  });
}

export class SiteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("365 Daily Snap render error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const language = typeof window === "undefined" ? "ko" : languageFromPath();
    const copy = UI_COPY[language];
    return (
      <main className="error-screen" id="main-content">
        <img src="/brand-symbol.svg" alt="365 Daily Snap" />
        <p className="eyebrow">365 DAILY SNAP</p>
        <h1>{copy.errorTitle}</h1>
        <p>{copy.errorText}</p>
        <div>
          <button type="button" className="button primary" onClick={() => window.location.reload()}><RefreshCw />{copy.reload}</button>
          <a className="button ghost" href={`/${language}`}>{copy.home}</a>
        </div>
      </main>
    );
  }
}

export default function SiteExperience({ children }) {
  const [language, setLanguage] = useState(() => languageFromPath());
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const copy = useMemo(() => UI_COPY[language] || UI_COPY.ko, [language]);

  useEffect(() => {
    const html = document.documentElement;
    const updateLanguage = () => setLanguage(UI_COPY[html.lang] ? html.lang : languageFromPath());
    const observer = new MutationObserver(updateLanguage);
    observer.observe(html, { attributes: true, attributeFilter: ["lang"] });
    window.addEventListener("popstate", updateLanguage);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", updateLanguage);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const documentHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const nextProgress = Math.min(1, Math.max(0, window.scrollY / documentHeight));
      setProgress(nextProgress);
      setShowTop(window.scrollY > 720);
      document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 12);

      const isHome = !window.location.pathname.split("/").filter(Boolean)[1];
      const navigationButtons = [...document.querySelectorAll(".site-header nav button")];
      let activeId = "";
      if (isHome) {
        const marker = (document.querySelector(".site-header")?.offsetHeight || 72) + 120;
        for (const id of SECTION_IDS) {
          const section = document.getElementById(id);
          if (!section) continue;
          const rect = section.getBoundingClientRect();
          if (rect.top <= marker && rect.bottom > marker) activeId = id;
        }
      }
      navigationButtons.forEach((button, index) => {
        const active = SECTION_IDS[index] === activeId;
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "location");
        else button.removeAttribute("aria-current");
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("popstate", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("popstate", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const updateNetwork = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  useEffect(() => {
    const apply = () => patchStaticAccessibility(copy);
    apply();
    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 20);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [copy]);

  useEffect(() => {
    const onImageError = (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied === "true") return;
      image.dataset.fallbackApplied = "true";
      image.classList.add("media-error");
      image.removeAttribute("srcset");
      image.src = "/brand-symbol.svg";
      image.alt = image.alt || copy.imageFallback;
    };
    document.addEventListener("error", onImageError, true);
    return () => document.removeEventListener("error", onImageError, true);
  }, [copy.imageFallback]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      const menuButton = document.querySelector(".menu-button[aria-expanded='true']");
      menuButton?.click();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      {!online && <div className="offline-banner" role="status"><WifiOff />{copy.offline}</div>}
      {children}
      <button
        type="button"
        className={`back-to-top ${showTop ? "visible" : ""}`}
        aria-label={copy.backToTop}
        title={copy.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp />
      </button>
    </>
  );
}
