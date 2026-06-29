import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Grid2X2,
  LayoutGrid,
  Link,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { fallbackContent, normalizeContent } from "./siteContent";
import { loadMergedPortfolio } from "./livePortfolio";
import { COPY } from "./siteCopy";
import { BUSINESS, CONTACT, cleanLocation, createProjectGroups, setMeta, useLanguage } from "./siteUtils";
import { InquiryForm, Media, ProjectModal, ReviewModal, SectionHeading } from "./siteComponents";

const EXTRA_COPY = {
  ko: {
    prepareNav: "준비 안내",
    portfolioView: "보기 방식",
    editorial: "크게 보기",
    contactSheet: "한눈에 보기",
    share: "공유하기",
    copied: "링크가 복사되었습니다.",
    backToPortfolio: "포트폴리오로 돌아가기",
    openMap: "지도에서 보기",
    detailCta: "이 분위기로 촬영 문의하기",
    prepEyebrow: "BEFORE THE SHOOT",
    prepTitle: "촬영 전, 이것만 준비하면 충분합니다.",
    prepDescription: "처음 촬영하는 분도 편하게 준비할 수 있도록 의상, 장소, 레퍼런스, 공개 범위를 미리 정리합니다.",
    availabilityTitle: "촬영 일정 안내",
    availabilityText:
      "주말과 공휴일, 평일 저녁 시간대 촬영을 중심으로 운영합니다. 평일 낮 촬영은 가능한 일정에 한해 별도 조율하며, 서울·수도권과 일산을 기본으로 그 외 지역도 문의 주시면 함께 확인합니다.",
    localTitle: "지역과 목적에 맞춰 보기",
    localDescription: "검색으로 들어온 방문자도 원하는 촬영 유형을 바로 확인할 수 있도록 주요 안내를 분리했습니다.",
    seoCta: "해당 촬영 문의하기",
    prepItems: [
      ["의상", "촬영 장소와 계절에 맞춰 1~2벌을 추천합니다. 과한 패턴보다 얼굴이 잘 보이는 색이 안정적입니다."],
      ["메이크업", "평소보다 조금 또렷한 정도면 충분합니다. 피부 표현은 보정 과정에서 자연스럽게 정리합니다."],
      ["레퍼런스", "원하는 분위기의 사진을 2~5장 정도 보내주시면 장소와 시간대를 더 정확히 제안할 수 있습니다."],
      ["장소", "서울숲, 성수, 연남, 한강, 반포, 일산처럼 이동 동선이 좋은 장소를 우선 추천합니다."],
      ["공개 범위", "포트폴리오 공개 가능 여부는 촬영 전에 먼저 확인합니다. 비공개 촬영도 가능합니다."],
      ["날씨", "비나 강풍이 예상되면 실내 장소로 바꾸거나 일정을 다시 조율합니다."],
    ],
  },
  en: {
    prepareNav: "Guide",
    portfolioView: "View mode",
    editorial: "Large",
    contactSheet: "Grid",
    share: "Share",
    copied: "Link copied.",
    backToPortfolio: "Back to portfolio",
    openMap: "Open map",
    detailCta: "Ask for this mood",
    prepEyebrow: "BEFORE THE SHOOT",
    prepTitle: "A simple guide before your session.",
    prepDescription: "Outfit, location, references and publishing preferences are clarified before the shoot.",
    availabilityTitle: "Availability",
    availabilityText:
      "Sessions are mainly scheduled on weekends, holidays, and weekday evenings. Weekday daytime sessions and areas outside Seoul, the capital area, or Ilsan can be discussed case by case.",
    localTitle: "Browse by area and purpose",
    localDescription: "Quick entry points for visitors searching by location or session type.",
    seoCta: "Inquire about this session",
    prepItems: [
      ["Outfit", "One or two looks are enough. Simple colors usually keep attention on your face."],
      ["Makeup", "A slightly clearer version of your usual look works well. Retouching stays natural."],
      ["References", "Send 2 to 5 images so the mood, place and timing can be planned faster."],
      ["Location", "Seoul Forest, Seongsu, Yeonnam, Hangang, Banpo and Ilsan are easy starting points."],
      ["Publishing", "Portfolio use is confirmed before the shoot. Private sessions are possible."],
      ["Weather", "Rain or strong wind can be handled by changing to an indoor spot or rescheduling."],
    ],
  },
  ja: {
    prepareNav: "準備案内",
    portfolioView: "表示",
    editorial: "大きく",
    contactSheet: "一覧",
    share: "共有",
    copied: "リンクをコピーしました。",
    backToPortfolio: "作品一覧へ戻る",
    openMap: "地図で見る",
    detailCta: "この雰囲気で相談する",
    prepEyebrow: "BEFORE THE SHOOT",
    prepTitle: "撮影前に確認しておくこと。",
    prepDescription: "衣装、場所、参考写真、公開範囲を事前に整理して撮影を進めます。",
    availabilityTitle: "撮影可能日",
    availabilityText:
      "週末・祝日・平日夜を中心に撮影しています。平日昼、ソウル首都圏・一山以外の地域は日程により相談可能です。",
    localTitle: "地域と目的で見る",
    localDescription: "場所や撮影目的から探す方のために、主要な案内を分けました。",
    seoCta: "この撮影を相談する",
    prepItems: [
      ["衣装", "場所と季節に合わせて1〜2着をおすすめします。顔が引き立つ色が安定します。"],
      ["メイク", "普段より少しはっきりした程度で十分です。補正は自然に整えます。"],
      ["参考写真", "希望する雰囲気の写真を2〜5枚ほど送ってください。"],
      ["場所", "ソウル森、聖水、延南、漢江、盤浦、一山など動きやすい場所を提案します。"],
      ["公開範囲", "ポートフォリオ使用可否は撮影前に確認します。非公開も可能です。"],
      ["天気", "雨や強風の場合は室内に変更、または日程を再調整します。"],
    ],
  },
};

const SEO_PAGES = {
  "seoul-portrait": {
    ko: {
      eyebrow: "SEOUL PORTRAIT",
      title: "서울에서 자연스럽게 남기는 인물 스냅",
      description: "성수, 연남, 한강, 서울숲처럼 이동하기 좋은 장소를 중심으로 개인 인물 스냅과 프로필 촬영을 진행합니다.",
      bullets: ["서울 전 지역 상담 가능", "평일 저녁·주말 중심", "자연광·거리·카페 촬영 추천"],
    },
    en: {
      eyebrow: "SEOUL PORTRAIT",
      title: "Natural portrait sessions in Seoul",
      description: "Personal portraits and profile sessions around Seongsu, Yeonnam, Hangang and Seoul Forest.",
      bullets: ["Seoul-wide consultation", "Evenings and weekends", "Natural light, street and cafe moods"],
    },
    ja: {
      eyebrow: "SEOUL PORTRAIT",
      title: "ソウルで自然に残すポートレート",
      description: "聖水、延南、漢江、ソウル森などを中心に人物スナップを撮影します。",
      bullets: ["ソウル全域相談可能", "平日夜・週末中心", "自然光・街・カフェ撮影"],
    },
  },
  "ilsan-profile": {
    ko: {
      eyebrow: "ILSAN PROFILE",
      title: "일산에서도 편하게 진행하는 프로필 촬영",
      description: "작가가 일산을 기반으로 이동하기 때문에 일산·고양 인근 촬영은 장소 추천과 일정 조율이 수월합니다.",
      bullets: ["일산·고양 지역 우선 상담", "호수공원·카페·거리 촬영", "서울 이동 촬영도 가능"],
    },
    en: {
      eyebrow: "ILSAN PROFILE",
      title: "Profile sessions around Ilsan",
      description: "Because the photographer is based in Ilsan, nearby locations can be planned more easily.",
      bullets: ["Ilsan and Goyang friendly", "Park, cafe and street options", "Seoul sessions available"],
    },
    ja: {
      eyebrow: "ILSAN PROFILE",
      title: "一山エリアのプロフィール撮影",
      description: "一山を拠点にしているため、近隣の場所提案と日程調整がしやすいです。",
      bullets: ["一山・高陽エリア相談", "公園・カフェ・街撮影", "ソウル移動も可能"],
    },
  },
  "couple-snap": {
    ko: {
      eyebrow: "COUPLE SNAP",
      title: "과하지 않게 담는 커플 스냅",
      description: "정해진 포즈보다 걷고 대화하는 흐름 속에서 두 사람의 편안한 표정을 남깁니다.",
      bullets: ["기념일·데이트 촬영", "한강·연남·서울숲 추천", "공개 범위 사전 조율"],
    },
    en: {
      eyebrow: "COUPLE SNAP",
      title: "Relaxed couple sessions",
      description: "Instead of rigid posing, the session follows walking, talking and natural movement.",
      bullets: ["Anniversary and date shoots", "Hangang, Yeonnam and Seoul Forest", "Publishing preference agreed first"],
    },
    ja: {
      eyebrow: "COUPLE SNAP",
      title: "自然なカップルスナップ",
      description: "決まったポーズより、歩きながら会話する流れの中で自然な表情を残します。",
      bullets: ["記念日・デート撮影", "漢江・延南・ソウル森", "公開範囲を事前確認"],
    },
  },
};

function InstagramIcon(props) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="16" height="16" x="4" y="4" rx="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.8" cy="7.2" r="1" fill="currentColor" />
    </svg>
  );
}

function currentPath() {
  return `${window.location.pathname}${window.location.hash}`;
}

function getRouteParts(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const language = COPY[parts[0]] ? parts[0] : "ko";
  return { language, page: parts[1] || "", slug: parts[2] ? decodeURIComponent(parts[2]) : "" };
}

function getProjectSlug(project = {}) {
  return String(project.id || project.title || "project").trim();
}

function getProjectPath(language, project) {
  return `/${language}/work/${encodeURIComponent(getProjectSlug(project))}`;
}

function getModelInfo(model) {
  if (model && typeof model === "object") {
    const name = String(model.name || model.handle || "").replace(/^@/, "");
    return { name, url: String(model.url || model.instagramUrl || model.sns || "") };
  }
  const raw = String(model || "").trim();
  const name = raw.replace(/^@/, "");
  const url = raw.startsWith("@") ? `https://www.instagram.com/${name}/` : "";
  return { name, url };
}

function mapUrl(location) {
  const label = cleanLocation(location);
  if (!label) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
}

function trackEvent(name, props = {}) {
  window.dispatchEvent(new CustomEvent("snap:analytics", { detail: { name, props } }));
  if (typeof window.plausible === "function") window.plausible(name, { props });
}

function useOptionalAnalytics() {
  useEffect(() => {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (!domain || document.querySelector("[data-snap-analytics]")) return;
    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = domain;
    script.dataset.snapAnalytics = "true";
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, []);
}

function ProjectDetailPage({ project, relatedProjects, copy, extra, language, onBack, onContact, onOpenProject }) {
  const [copied, setCopied] = useState(false);
  const cover = project.media[0];
  const location = cleanLocation(project.location || cover?.location);
  const maps = mapUrl(project.location || cover?.location);
  const pageUrl = `${window.location.origin}${getProjectPath(language, project)}`;

  const share = async () => {
    trackEvent("Project share", { project: project.title });
    if (navigator.share) {
      await navigator.share({ title: project.title, text: project.description || "365 Daily Snap", url: pageUrl }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(pageUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main>
      <section className="project-detail section-wrap">
        <button className="text-link detail-back" type="button" onClick={onBack}>
          <ArrowLeft />
          {extra.backToPortfolio}
        </button>
        <div className="project-detail-hero">
          <div className="project-detail-copy">
            <p className="eyebrow">{project.category || "PORTRAIT"}</p>
            <h1>{project.title}</h1>
            {project.description && <p>{project.description}</p>}
            <div className="project-detail-meta">
              {location && <span><MapPin />{location}</span>}
              <span><Camera />{project.media.length} {copy.photoCount}</span>
              {project.models?.map(getModelInfo).filter((model) => model.name).map((model) => (
                model.url ? <a key={model.name} href={model.url} target="_blank" rel="noreferrer"><InstagramIcon />@{model.name}</a> : <span key={model.name}>@{model.name}</span>
              ))}
            </div>
            <div className="detail-actions">
              <button className="button primary" type="button" onClick={onContact}>{extra.detailCta}<ArrowRight /></button>
              <button className="button ghost" type="button" onClick={share}><Link />{copied ? extra.copied : extra.share}</button>
              {maps && <a className="button ghost" href={maps} target="_blank" rel="noreferrer"><MapPin />{extra.openMap}</a>}
            </div>
          </div>
          {cover?.src && <button className="detail-cover" type="button" onClick={() => onOpenProject(project)}><Media src={cover.src} alt={cover.alt || project.title} eager /><span className="watermark">© 365 Daily Snap</span></button>}
        </div>
        <div className="detail-media-grid">
          {project.media.map((media, index) => (
            <button type="button" key={`${media.src}-${index}`} onClick={() => onOpenProject(project)} className={index % 5 === 0 ? "wide" : ""}>
              <Media src={media.src} alt={media.alt || media.caption || project.title} />
              {cleanLocation(media.location) && <span>{cleanLocation(media.location)}</span>}
            </button>
          ))}
        </div>
      </section>
      {relatedProjects.length > 0 && (
        <section className="section section-wrap related-projects">
          <SectionHeading eyebrow="NEXT" title="비슷한 작업도 함께 보기" />
          <div className="project-grid contact-sheet">
            {relatedProjects.slice(0, 4).map((item) => (
              <article className="project-card" key={item.id}>
                <button type="button" className="project-cover" onClick={() => onOpenProject(item)}>
                  <Media src={item.cover || item.media[0]?.src} alt={item.title} />
                </button>
                <div className="project-card-copy">
                  <div><p>{item.category || "Portrait"}</p><h3>{item.title}</h3></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SeoLandingPage({ page, projects, copy, extra, onContact, onOpenProject }) {
  const matchedProjects = projects.filter((project) => {
    const text = `${project.title} ${project.category} ${project.description} ${cleanLocation(project.location)} ${(project.tags || []).join(" ")}`;
    return page.bullets.some((bullet) => text.includes(bullet.split("·")[0].trim())) || text.includes(page.eyebrow.split(" ")[0]);
  });
  const shown = matchedProjects.length ? matchedProjects : projects.slice(0, 4);

  return (
    <main>
      <section className="seo-landing section-wrap">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="seo-bullets">{page.bullets.map((item) => <span key={item}><Check />{item}</span>)}</div>
          <button className="button primary" type="button" onClick={onContact}>{extra.seoCta}<ArrowRight /></button>
        </div>
        <div className="seo-photo-grid">
          {shown.slice(0, 4).map((project) => <button key={project.id} type="button" onClick={() => onOpenProject(project)}><Media src={project.cover || project.media[0]?.src} alt={project.title} /></button>)}
        </div>
      </section>
    </main>
  );
}

function PrepareSection({ extra, language, onContact }) {
  return (
    <section id="prepare" className="prepare-section">
      <div className="section section-wrap">
        <SectionHeading eyebrow={extra.prepEyebrow} title={extra.prepTitle} description={extra.prepDescription} />
        <div className="availability-note">
          <div><CalendarDays /><h3>{extra.availabilityTitle}</h3></div>
          <p>{extra.availabilityText}</p>
          <button className="text-link" type="button" onClick={onContact}>{EXTRA_COPY[language].detailCta}<ArrowRight /></button>
        </div>
        <div className="prepare-grid">
          {extra.prepItems.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalSeoSection({ language, extra, navigate }) {
  const items = Object.entries(SEO_PAGES).map(([slug, pages]) => ({ slug, ...pages[language] }));
  return (
    <section className="section section-wrap local-seo-section">
      <SectionHeading eyebrow="LOCAL GUIDE" title={extra.localTitle} description={extra.localDescription} />
      <div className="local-seo-grid">
        {items.map((item) => (
          <a key={item.slug} href={`/${language}/${item.slug}`} onClick={(event) => { event.preventDefault(); navigate(`/${language}/${item.slug}`); }}>
            <p className="eyebrow">{item.eyebrow}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>{extra.seoCta}<ArrowRight /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [language, setLanguage] = useLanguage();
  const copy = COPY[language];
  const extra = EXTRA_COPY[language] || EXTRA_COPY.ko;
  const [content, setContent] = useState(() => normalizeContent(fallbackContent));
  const [routeSnapshot, setRouteSnapshot] = useState(() => currentPath());
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryMode, setGalleryMode] = useState("editorial");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [projectModal, setProjectModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useOptionalAnalytics();

  useEffect(() => {
    const onPop = () => setRouteSnapshot(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadMergedPortfolio(fallbackContent)
      .then((data) => mounted && setContent(normalizeContent(data)))
      .catch(() => mounted && setContent(normalizeContent(fallbackContent)));
    return () => { mounted = false; };
  }, []);

  const projects = useMemo(() => createProjectGroups(content), [content]);
  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);
  const reviews = content.testimonials || [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const heroProject = projects[0];
  const heroMedia = heroProject?.media || [];
  const route = getRouteParts(window.location.pathname);
  const detailProject = route.page === "work" ? projects.find((project) => getProjectSlug(project) === route.slug) : null;
  const seoPage = route.page && SEO_PAGES[route.page] ? SEO_PAGES[route.page][language] : null;
  const navItems = [
    ["work", copy.nav.work],
    ["sessions", copy.nav.sessions],
    ["prepare", extra.prepareNav],
    ["reviews", copy.nav.reviews],
    ["about", copy.nav.about],
    ["faq", copy.nav.faq],
    ["contact", copy.nav.contact],
  ];

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRouteSnapshot(currentPath());
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const scrollTo = (id) => {
    if (route.page) {
      navigate(`/${language}#${id}`);
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const openProjectPage = (project) => {
    trackEvent("Project open", { project: project.title });
    navigate(getProjectPath(language, project));
  };

  useEffect(() => {
    const title = detailProject ? `${detailProject.title} | 365 Daily Snap` : seoPage ? `${seoPage.title} | 365 Daily Snap` : copy.title;
    const description = detailProject?.description || seoPage?.description || copy.description;
    const canonicalPath = route.page ? `/${language}/${route.page}${route.slug ? `/${encodeURIComponent(route.slug)}` : ""}` : `/${language}`;
    document.documentElement.lang = language === "ja" ? "ja" : language;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:locale", language === "ko" ? "ko_KR" : language === "ja" ? "ja_JP" : "en_US", true);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `https://snap.lavalabs.co.kr${canonicalPath}`;
  }, [language, copy, detailProject, seoPage, route.page, route.slug]);

  const renderHome = () => (
    <main>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p className="hero-description">{copy.heroDescription}</p>
          <div className="hero-actions"><button className="button primary" type="button" onClick={() => scrollTo("work")}>{copy.heroPrimary}<ArrowRight /></button><button className="button ghost" type="button" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button></div>
          <div className="trust-row">{copy.trust.map((item) => <span key={item}><Check />{item}</span>)}</div>
        </div>
        <div className="hero-collage" aria-label="Featured photography">
          {heroMedia[0]?.src && <button className="hero-photo hero-photo-main" type="button" onClick={() => heroProject && openProjectPage(heroProject)}><Media src={heroMedia[0].src} alt={heroMedia[0].alt || heroProject.title} eager /><span className="watermark">© 365 Daily Snap</span></button>}
          <div className="hero-photo-stack">{heroMedia.slice(1, 3).map((item, index) => <button className="hero-photo" type="button" key={item.src} onClick={() => heroProject && openProjectPage(heroProject)}><Media src={item.src} alt={item.alt || heroProject.title} eager={index === 0} /><span className="watermark">© 365 Daily Snap</span></button>)}</div>
        </div>
      </section>

      <section id="work" className="section section-wrap">
        <SectionHeading eyebrow={copy.workEyebrow} title={copy.workTitle} description={copy.workDescription} />
        <div className="portfolio-toolbar">
          <p>{extra.portfolioView}</p>
          <div role="group" aria-label={extra.portfolioView}>
            <button type="button" className={galleryMode === "editorial" ? "active" : ""} aria-pressed={galleryMode === "editorial"} onClick={() => setGalleryMode("editorial")}><LayoutGrid />{extra.editorial}</button>
            <button type="button" className={galleryMode === "sheet" ? "active" : ""} aria-pressed={galleryMode === "sheet"} onClick={() => setGalleryMode("sheet")}><Grid2X2 />{extra.contactSheet}</button>
          </div>
        </div>
        <div className={`project-grid ${galleryMode === "sheet" ? "contact-sheet" : ""}`}>{visibleProjects.map((project, index) => <article className={`project-card ${index === 0 ? "featured" : ""}`} key={project.id}><button type="button" className="project-cover" onClick={() => openProjectPage(project)}><Media src={project.cover || project.media[0]?.src} alt={project.title} eager={index < 2} /><span className="watermark">© 365 Daily Snap</span><span className="project-number">{String(index + 1).padStart(2, "0")}</span></button><div className="project-card-copy"><div><p>{project.category || "Portrait"}</p><h3>{project.title}</h3></div><div className="project-card-meta">{cleanLocation(project.location) && <span><MapPin />{cleanLocation(project.location)}</span>}<span><Camera />{project.media.length} {copy.photoCount}</span></div><div className="project-card-actions"><button className="text-link" type="button" onClick={() => openProjectPage(project)}>{copy.viewProject}<ArrowRight /></button><button className="text-link share-mini" type="button" onClick={async () => { await navigator.clipboard?.writeText(`${window.location.origin}${getProjectPath(language, project)}`); trackEvent("Project link copied", { project: project.title }); }}><Copy />{extra.share}</button></div></div></article>)}</div>
        {projects.length > 6 && <button className="button ghost centered" type="button" onClick={() => setShowAllProjects((value) => !value)}>{showAllProjects ? copy.lessProjects : copy.moreProjects}{showAllProjects ? <ChevronUp /> : <ChevronDown />}</button>}
      </section>

      <section className="why-section"><div className="section-wrap section"><SectionHeading eyebrow={copy.whyEyebrow} title={copy.whyTitle} /><div className="why-grid">{copy.whyItems.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
      <section id="sessions" className="section section-wrap"><SectionHeading eyebrow={copy.sessionsEyebrow} title={copy.sessionsTitle} description={copy.sessionsDescription} /><div className="session-grid">{copy.sessions.map((session) => { const Icon = session.icon; return <article key={session.name}><div className="session-icon"><Icon /></div><p className="eyebrow">{session.name}</p><h3>{session.title}</h3><span className="session-time"><Clock3 />{session.time}</span><p>{session.text}</p><div className="tag-row">{session.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>; })}</div></section>
      <PrepareSection extra={extra} language={language} onContact={() => scrollTo("contact")} />
      <section className="process-section"><div className="section section-wrap"><SectionHeading eyebrow={copy.processEyebrow} title={copy.processTitle} /><div className="process-grid">{copy.process.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
      <section id="reviews" className="section section-wrap"><SectionHeading eyebrow={copy.reviewsEyebrow} title={copy.reviewsTitle} description={copy.reviewsDescription} /><div className="review-grid">{visibleReviews.map((review) => <article className="review-card" key={`${review.name}-${review.date}`}><div className="quote-mark">“</div><p>{review.content}</p><footer><div><strong>{review.name}</strong><span>{review.type} · {review.date}</span></div>{review.reviewImage && <button type="button" onClick={() => setReviewModal(review)}>{copy.reviewOriginal}<ExternalLink /></button>}</footer></article>)}</div>{reviews.length > 3 && <button className="button ghost centered" type="button" onClick={() => setShowAllReviews((value) => !value)}>{showAllReviews ? copy.lessProjects : copy.moreReviews}{showAllReviews ? <ChevronUp /> : <ChevronDown />}</button>}</section>
      <LocalSeoSection language={language} extra={extra} navigate={navigate} />
      <section id="about" className="about-section"><div className="section section-wrap about-grid"><div className="about-visual"><div className="about-monogram">K<br />M</div><Camera /></div><div><p className="eyebrow">{copy.aboutEyebrow}</p><h2>{copy.aboutTitle}</h2><p>{copy.aboutText}</p><div className="about-facts">{copy.aboutFacts.map((fact) => <span key={fact}><Check />{fact}</span>)}</div><a className="text-link" href={CONTACT.instagramUrl} target="_blank" rel="noreferrer"><InstagramIcon />{CONTACT.instagramHandle}<ExternalLink /></a></div></div></section>
      <section id="faq" className="section section-wrap"><SectionHeading eyebrow={copy.faqEyebrow} title={copy.faqTitle} /><div className="faq-list">{copy.faqs.map((item, index) => <article key={item.q} className={faqOpen === index ? "open" : ""}><button type="button" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.q}</b>{faqOpen === index ? <ChevronUp /> : <ChevronDown />}</button>{faqOpen === index && <p>{item.a}</p>}</article>)}</div></section>
      <section id="contact" className="contact-section"><div className="section section-wrap contact-grid"><div><p className="eyebrow">{copy.inquiryEyebrow}</p><h2>{copy.inquiryTitle}</h2><p>{copy.inquiryDescription}</p><div className="contact-direct"><a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("Kakao click")}><MessageCircle /><span><b>KakaoTalk</b><small>Open chat</small></span><ExternalLink /></a><a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("Instagram click")}><InstagramIcon /><span><b>Instagram DM</b><small>{CONTACT.instagramHandle}</small></span><ExternalLink /></a></div></div><InquiryForm copy={copy} language={language} onTrack={trackEvent} /></div></section>
    </main>
  );

  return (
    <div className="site-shell" data-route={routeSnapshot}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate(`/${language}`)}><span>365</span><b>Daily Snap</b></button>
        <nav className={menuOpen ? "open" : ""} aria-label="Primary navigation">
          {navItems.map(([key, label]) => <button key={key} type="button" onClick={() => scrollTo(key)}>{label}</button>)}
        </nav>
        <div className="header-tools">
          <div className="language-switch" aria-label="Language"><Globe2 />{Object.keys(COPY).map((code) => <button key={code} type="button" className={language === code ? "active" : ""} onClick={() => setLanguage(code)}>{code.toUpperCase()}</button>)}</div>
          <button type="button" className="button compact primary desktop-cta" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button>
          <button type="button" className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      {detailProject ? (
        <ProjectDetailPage
          project={detailProject}
          relatedProjects={projects.filter((project) => project.id !== detailProject.id)}
          copy={copy}
          extra={extra}
          language={language}
          onBack={() => scrollTo("work")}
          onContact={() => scrollTo("contact")}
          onOpenProject={setProjectModal}
        />
      ) : seoPage ? (
        <SeoLandingPage page={seoPage} projects={projects} copy={copy} extra={extra} onContact={() => scrollTo("contact")} onOpenProject={openProjectPage} />
      ) : renderHome()}

      <footer className="site-footer section-wrap"><div><b>365 Daily Snap</b><p>{copy.footerLine}</p></div><div className="footer-business"><span>{BUSINESS.name} · {language === "ko" ? "대표" : "Representative"} {BUSINESS.representative}</span><span>{BUSINESS.registration} · {BUSINESS.onlineSales}</span><span>{BUSINESS.email}</span></div><button type="button" onClick={() => setPrivacyOpen(true)}>{copy.privacy}</button><p>© 2026 365 Daily Snap. All rights reserved.</p></footer>
      <div className="mobile-contact-bar"><button type="button" onClick={() => scrollTo("contact")}><CalendarDays />{copy.heroSecondary}</button><a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer"><MessageCircle />Kakao</a></div>
      <ProjectModal project={projectModal} copy={copy} onClose={() => setProjectModal(null)} />
      <ReviewModal review={reviewModal} copy={copy} onClose={() => setReviewModal(null)} />
      {privacyOpen && <div className="modal-backdrop" onMouseDown={() => setPrivacyOpen(false)} role="presentation"><section className="privacy-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" type="button" onClick={() => setPrivacyOpen(false)}><X /></button><ShieldCheck /><h2>{copy.privacy}</h2><p>{copy.consentDetail}</p><dl><dt>Controller</dt><dd>{BUSINESS.name} · {BUSINESS.representative}</dd><dt>Contact</dt><dd>{BUSINESS.email}</dd><dt>Business address</dt><dd>{BUSINESS.address}</dd></dl></section></div>}
    </div>
  );
}

export default App;
