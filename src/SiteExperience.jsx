import { Component, useEffect, useMemo, useState } from "react";
import { ArrowUp, RefreshCw, WifiOff } from "lucide-react";

const SECTION_IDS = ["work", "sessions", "prepare", "reviews", "about", "faq", "contact"];
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || "/api/analytics";
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || (typeof window !== "undefined" ? window.location.hostname : "");
const PRIVATE_PROP_PATTERN = /name|email|contact|phone|message|address|token|file/i;

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
    close: "닫기",
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
    close: "Close",
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
    close: "閉じる",
    featured: "代表写真",
    related: "関連する作品を見る",
    controller: "個人情報取扱者",
    contact: "連絡先",
    address: "事業所所在地",
    imageFallback: "画像を読み込めませんでした。",
  },
};

const COPY_REPLACEMENTS = {
  ko: new Map([
    ["서툴러도 자연스럽게", "처음부터 편안하게"],
    ["정형화된 구성보다 촬영 목적과 장소, 이동 시간, 보정 범위에 맞춰 필요한 내용을 상담 후 안내합니다.", "촬영 목적과 장소, 이동 시간, 보정 범위에 맞춰 필요한 내용을 상담 후 안내합니다."],
    ["정해진 포즈보다 걷고 대화하는 흐름 속에서 두 사람다운 장면을 기록합니다.", "걷고 대화하는 흐름 속에서 두 사람다운 장면을 기록합니다."],
    ["365 Daily Snap은 정해진 포즈를 반복하기보다 대화와 움직임 속에서 각자의 자연스러운 표정을 찾습니다. 사진이 익숙하지 않은 분도 부담 없이 촬영할 수 있도록 준비부터 현장 디렉팅, 셀렉과 전달까지 차분하게 안내합니다.", "365 Daily Snap은 대화와 움직임 속에서 각자의 자연스러운 표정을 찾습니다. 사진이 익숙하지 않은 분도 부담 없이 촬영할 수 있도록 준비부터 현장 디렉팅, 셀렉과 전달까지 차분하게 안내합니다."],
    ["노출과 색감, 피부톤, 배경의 방해 요소를 자연스럽게 정리합니다. 얼굴형이나 체형을 크게 바꾸는 과도한 변형은 기본 보정에 포함하지 않습니다.", "노출과 색감, 피부톤, 배경의 방해 요소를 자연스럽게 정리하고 본래의 인상을 유지하는 범위에서 보정합니다."],
    ["과하지 않게 담는 커플 스냅", "두 사람다운 흐름을 담는 커플 스냅"],
    ["정해진 포즈보다 걷고 대화하는 흐름 속에서 두 사람의 편안한 표정을 남깁니다.", "걷고 대화하는 흐름 속에서 두 사람의 편안한 표정과 분위기를 남깁니다."],
  ]),
  en: new Map([
    ["Natural, even if you feel awkward", "Comfortable from the first frame"],
    ["Rather than forcing every shoot into a fixed package, the final plan is shaped around purpose, location, travel time and retouching scope.", "The final plan is shaped around purpose, location, travel time and retouching scope."],
    ["Your connection is photographed through walking, talking and genuine movement rather than fixed poses.", "Your connection is photographed through walking, talking and genuine movement."],
    ["365 Daily Snap looks for natural expressions in conversation and movement instead of repeating fixed poses. From preparation and on-set direction to selection and delivery, every step is explained clearly so first-time clients can feel at ease.", "365 Daily Snap looks for natural expressions in conversation and movement. From preparation and on-set direction to selection and delivery, every step is explained clearly so first-time clients can feel at ease."],
    ["Exposure, color, skin tone and distracting background elements are refined naturally. Major changes to face shape or body proportions are not included in the standard edit.", "Exposure, color, skin tone and distracting background elements are refined while keeping your natural features and proportions intact."],
  ]),
  ja: new Map([
    ["慣れていなくても自然に", "初めてでも心地よく"],
    ["決まったプランに当てはめるのではなく、目的、場所、移動、レタッチ範囲に合わせて内容をご案内します。", "目的、場所、移動、レタッチ範囲に合わせて撮影内容をご案内します。"],
    ["決まったポーズより、歩きながら会話する二人らしい流れを撮影します。", "歩きながら会話する二人らしい流れを撮影します。"],
    ["365 Daily Snapでは、同じポーズを繰り返すのではなく、会話や動きの中からその人らしい表情を探します。準備、撮影中のディレクション、セレクト、納品まで、初めての方にもわかりやすくご案内します。", "365 Daily Snapでは、会話や動きの中からその人らしい表情を探します。準備、撮影中のディレクション、セレクト、納品まで、初めての方にもわかりやすくご案内します。"],
    ["明るさ、色、肌色、背景の気になる部分を自然に整えます。顔や体型を大きく変える加工は基本レタッチに含みません。", "明るさ、色、肌色、背景を自然に整え、本来の印象を大切にレタッチします。"],
  ]),
};

function languageFromPath() {
  const language = window.location.pathname.split("/").filter(Boolean)[0];
  return UI_COPY[language] ? language : "ko";
}

function getSessionId() {
  try {
    const key = "snap-analytics-session";
    const current = window.sessionStorage.getItem(key);
    if (current) return current;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(key, next);
    return next;
  } catch {
    return "session-unavailable";
  }
}

function sanitizeAnalyticsProps(props = {}) {
  return Object.fromEntries(Object.entries(props)
    .filter(([key, value]) => !PRIVATE_PROP_PATTERN.test(key) && ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 12)
    .map(([key, value]) => [key.slice(0, 40), typeof value === "string" ? value.slice(0, 120) : value]));
}

function routePath() {
  return `${window.location.pathname}${window.location.hash}`.slice(0, 240);
}

function recordAnalytics(name, props = {}, options = {}) {
  if (!name || typeof window === "undefined") return;
  const safeProps = sanitizeAnalyticsProps(props);
  const payload = {
    name: String(name).slice(0, 80),
    path: routePath(),
    language: document.documentElement.lang || languageFromPath(),
    sessionId: getSessionId(),
    referrer: document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return ""; } })() : "",
    props: safeProps,
    timestamp: new Date().toISOString(),
  };

  if (options.plausible !== false && typeof window.plausible === "function") {
    window.plausible(payload.name, { props: safeProps });
  }

  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

function initializePlausible() {
  if (!PLAUSIBLE_DOMAIN || /localhost|127\.0\.0\.1/.test(PLAUSIBLE_DOMAIN)) return;
  window.plausible = window.plausible || function plausibleQueue() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  if (document.querySelector("[data-snap-analytics]")) return;
  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.dataset.snapAnalytics = "true";
  script.src = "https://plausible.io/js/script.js";
  document.head.appendChild(script);
}

function patchHistoryEvents() {
  if (window.__snapHistoryPatched) return;
  window.__snapHistoryPatched = true;
  ["pushState", "replaceState"].forEach((method) => {
    const original = window.history[method];
    window.history[method] = function patchedHistory(...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event("snap:navigation"));
      return result;
    };
  });
  window.addEventListener("popstate", () => window.dispatchEvent(new Event("snap:navigation")));
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

  document.querySelectorAll(".modal-close").forEach((button) => button.setAttribute("aria-label", copy.close));
}

function patchPositiveCopy(language) {
  const replacements = COPY_REPLACEMENTS[language] || COPY_REPLACEMENTS.ko;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue?.trim();
    if (value && replacements.has(value)) node.nodeValue = node.nodeValue.replace(value, replacements.get(value));
    node = walker.nextNode();
  }
}

function mediaSizes(image) {
  if (image.closest(".hero-photo-main")) return "(max-width: 760px) 100vw, 55vw";
  if (image.closest(".hero-photo-stack")) return "(max-width: 760px) 50vw, 24vw";
  if (image.closest(".photo-motion-card")) return "(max-width: 760px) 46vw, 20vw";
  if (image.closest(".project-cover")) return "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 34vw";
  if (image.closest(".detail-media-grid")) return "(max-width: 760px) 100vw, 50vw";
  if (image.closest(".project-modal-stage")) return "(max-width: 760px) 100vw, 70vw";
  return "100vw";
}

function optimizeMedia(root = document) {
  const images = root.querySelectorAll?.("img") || [];
  const priorityImage = document.querySelector(".hero-photo-main img");
  images.forEach((image) => {
    if (image.dataset.performanceHinted === "true") return;
    image.dataset.performanceHinted = "true";
    const priority = image === priorityImage || Boolean(image.closest(".detail-cover, .project-modal-stage"));
    image.loading = priority ? "eager" : "lazy";
    image.decoding = priority ? "sync" : "async";
    image.fetchPriority = priority ? "high" : "low";
    if (!image.sizes) image.sizes = mediaSizes(image);
    const recordDimensions = () => {
      if (image.naturalWidth && image.naturalHeight) {
        if (!image.width) image.width = image.naturalWidth;
        if (!image.height) image.height = image.naturalHeight;
      }
    };
    if (image.complete) recordDimensions();
    else image.addEventListener("load", recordDimensions, { once: true });
  });
}

function observeVideos() {
  if (!("IntersectionObserver" in window)) return () => {};
  const observed = new WeakSet();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) video.preload = "metadata";
      else if (!video.closest(".project-modal-stage")) {
        video.pause();
        video.preload = "none";
      }
    });
  }, { rootMargin: "320px 0px" });

  const attach = () => document.querySelectorAll("video").forEach((video) => {
    if (observed.has(video)) return;
    observed.add(video);
    if (!video.closest(".hero-photo-main, .project-modal-stage")) video.preload = "none";
    observer.observe(video);
  });
  attach();
  const mutation = new MutationObserver(attach);
  mutation.observe(document.body, { childList: true, subtree: true });
  return () => { mutation.disconnect(); observer.disconnect(); };
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
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
    recordAnalytics("Render error", { component: info?.componentStack?.split("\n")[1]?.trim() || "unknown" });
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
    initializePlausible();
    patchHistoryEvents();
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const updateLanguage = () => {
      const nextLanguage = UI_COPY[html.lang] ? html.lang : languageFromPath();
      setLanguage((current) => {
        if (current !== nextLanguage) recordAnalytics("Language change", { from: current, to: nextLanguage });
        return nextLanguage;
      });
    };
    const observer = new MutationObserver(updateLanguage);
    observer.observe(html, { attributes: true, attributeFilter: ["lang"] });
    window.addEventListener("snap:navigation", updateLanguage);
    return () => {
      observer.disconnect();
      window.removeEventListener("snap:navigation", updateLanguage);
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
    window.addEventListener("snap:navigation", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("snap:navigation", requestUpdate);
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
    const apply = () => {
      patchStaticAccessibility(copy);
      patchPositiveCopy(language);
      optimizeMedia();
    };
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
  }, [copy, language]);

  useEffect(() => observeVideos(), []);

  useEffect(() => {
    const onImageError = (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied === "true") return;
      image.dataset.fallbackApplied = "true";
      image.classList.add("media-error");
      image.removeAttribute("srcset");
      const failedSource = image.currentSrc?.split("/").pop() || "unknown";
      image.src = "/brand-symbol.svg";
      image.alt = image.alt || copy.imageFallback;
      recordAnalytics("Image error", { source: failedSource });
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

  useEffect(() => {
    const onExistingEvent = (event) => recordAnalytics(event.detail?.name, event.detail?.props, { plausible: false });
    window.addEventListener("snap:analytics", onExistingEvent);
    return () => window.removeEventListener("snap:analytics", onExistingEvent);
  }, []);

  useEffect(() => {
    const visited = new Set();
    const trackPage = () => {
      const path = routePath();
      if (!visited.has(path)) {
        visited.add(path);
        recordAnalytics("Page view", { title: document.title.slice(0, 100) });
      }
    };
    trackPage();
    window.addEventListener("snap:navigation", trackPage);
    return () => window.removeEventListener("snap:navigation", trackPage);
  }, []);

  useEffect(() => {
    let reached = new Set();
    const reset = () => { reached = new Set(); };
    const trackDepth = () => {
      const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const depth = Math.round((window.scrollY / height) * 100);
      [25, 50, 75, 90].forEach((threshold) => {
        if (depth >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          recordAnalytics("Scroll depth", { percent: threshold });
        }
      });
    };
    window.addEventListener("scroll", trackDepth, { passive: true });
    window.addEventListener("snap:navigation", reset);
    return () => {
      window.removeEventListener("scroll", trackDepth);
      window.removeEventListener("snap:navigation", reset);
    };
  }, []);

  useEffect(() => {
    const onClick = (event) => {
      const element = event.target.closest?.("a, button");
      if (!element) return;
      let area = "button";
      if (element.closest(".mobile-contact-bar")) area = "mobile contact";
      else if (element.closest(".contact-direct")) area = "direct contact";
      else if (element.closest(".hero-actions")) area = "hero";
      else if (element.closest(".portfolio-cta-strip")) area = "portfolio CTA";
      else if (element.closest(".language-switch")) area = "language";
      else if (element.closest(".project-card")) area = "project";
      else if (element.closest(".inquiry-panel")) area = "inquiry form";
      const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
      recordAnalytics("CTA click", {
        area,
        action: (element.getAttribute("aria-label") || element.textContent || element.className || "click").trim().slice(0, 80),
        destination: href.startsWith("http") ? (() => { try { return new URL(href).hostname; } catch { return "external"; } })() : href.slice(0, 80),
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    let lcp = 0;
    let cls = 0;
    const observers = [];
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        lcp = entries.at(-1)?.startTime || lcp;
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObserver);
    } catch {}
    try {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => { if (!entry.hadRecentInput) cls += entry.value; });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
      observers.push(clsObserver);
    } catch {}

    let reported = false;
    const report = () => {
      if (reported) return;
      reported = true;
      const navigation = performance.getEntriesByType("navigation")[0];
      recordAnalytics("Web vitals", {
        lcp: Math.round(lcp),
        cls: Number(cls.toFixed(3)),
        ttfb: navigation ? Math.round(navigation.responseStart) : 0,
        load: navigation ? Math.round(navigation.loadEventEnd) : 0,
      });
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") report(); };
    window.addEventListener("pagehide", report, { once: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observers.forEach((observer) => observer.disconnect());
      document.removeEventListener("visibilitychange", onVisibility);
    };
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