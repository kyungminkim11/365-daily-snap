const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const HIDDEN_LOCATION = { city: "협의", district: "미정", place: "확인 필요", mapX: 50, mapY: 50 };
const INSTAGRAM_CARD_SIZE = 3;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function normalizeLocation(location) {
  if (!location || typeof location !== "object") return HIDDEN_LOCATION;
  const hasValue = [location.city, location.district, location.place].some((value) => String(value || "").trim());
  return hasValue ? location : HIDDEN_LOCATION;
}

function tagsWithSourceLink(tags, url) {
  const cleanTags = Array.isArray(tags) ? tags.filter((tag) => !String(tag).startsWith("__instagram:")) : [];
  return url ? [...cleanTags, `__instagram:${url}`] : cleanTags;
}

function normalizeMedia(media, fallbackTitle) {
  if (!Array.isArray(media)) return [];
  return media
    .map((item) => {
      const instagramUrl = String(item?.instagramUrl || "").trim();
      return {
        type: item?.type === "video" ? "video" : "image",
        src: String(item?.src || item?.image || "").trim(),
        alt: String(item?.alt || fallbackTitle || "365 Daily Snap").trim(),
        caption: String(item?.caption || "").trim(),
        tags: tagsWithSourceLink(item?.tags, instagramUrl),
        models: Array.isArray(item?.models) ? item.models : [],
        location: normalizeLocation(item?.location),
        instagramUrl,
        externalId: String(item?.externalId || "").trim(),
      };
    })
    .filter((item) => item.src);
}

function manualRowToProject(row) {
  const title = String(row.title || "촬영 기록").trim();
  const media = normalizeMedia(row.media, title);
  const instagramUrl = String(row.permalink || "").trim();
  return {
    id: `cms-${row.id}`,
    source: row.source || "manual",
    externalId: String(row.external_id || row.id),
    title,
    subtitle: row.source === "instagram" ? "@365daily.snap" : "365 Daily Snap",
    description: String(row.description || row.source_caption || "").trim(),
    category: String(row.category || "인물 사진").trim(),
    tags: tagsWithSourceLink(row.tags, instagramUrl),
    models: Array.isArray(row.models) ? row.models : [],
    location: normalizeLocation(row.location),
    cover: media[0]?.src || "",
    media,
    instagramUrl,
    sourcePublishedAt: row.source_published_at || row.created_at || "",
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order || 1000),
  };
}

function unique(values = []) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function sceneLabel(tags = []) {
  const labels = [
    ["웨딩무드", "웨딩 무드"],
    ["한복", "한복 스냅"],
    ["반려동물", "반려동물 스냅"],
    ["동물스냅", "동물 스냅"],
    ["바다", "바다 인물 스냅"],
    ["카페", "카페 포트레이트"],
    ["네온", "야간 네온 스냅"],
    ["밤", "야간 인물 스냅"],
    ["플라워", "플라워 포트레이트"],
    ["거리", "거리 인물 스냅"],
    ["프로필", "프로필 포트레이트"],
  ];
  return labels.find(([tag]) => tags.includes(tag))?.[1] || "인물 스냅";
}

function buildScreenshotGridProjects(staticProjects = []) {
  const archive = staticProjects.find((project) => /archive|아카이브/i.test(`${project?.title || ""} ${project?.category || ""}`));
  if (!archive) return [];
  const archiveMedia = normalizeMedia(archive.media, archive.title);
  const projects = [];

  for (let start = 0; start < archiveMedia.length; start += INSTAGRAM_CARD_SIZE) {
    const media = archiveMedia.slice(start, start + INSTAGRAM_CARD_SIZE);
    if (!media.length) continue;
    const models = unique(media.flatMap((item) => item.models || []));
    const visibleTags = unique(media.flatMap((item) => item.tags || []).filter((tag) => !String(tag).startsWith("__instagram:")));
    const label = sceneLabel(visibleTags);
    const owner = models[0] ? `@${String(models[0]).replace(/^@/, "")} · ` : "";
    const number = String(Math.floor(start / INSTAGRAM_CARD_SIZE) + 1).padStart(2, "0");
    const firstLinkTag = media.flatMap((item) => item.tags || []).find((tag) => String(tag).startsWith("__instagram:"));

    projects.push({
      id: `instagram-grid-${number}`,
      source: "instagram-snapshot",
      title: `${owner}${label}`,
      subtitle: "@365daily.snap",
      description: "현재 Instagram 메인 그리드 순서에 맞춰 묶은 촬영 시리즈입니다.",
      category: "Instagram",
      tags: firstLinkTag ? [...visibleTags, firstLinkTag] : visibleTags,
      models,
      location: media.find((item) => item.location)?.location || HIDDEN_LOCATION,
      cover: media[0].src,
      media,
      instagramUrl: firstLinkTag ? String(firstLinkTag).slice("__instagram:".length) : "",
      sortOrder: start,
    });
  }

  return projects;
}

async function loadManualProjects() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const columns = [
    "id",
    "source",
    "external_id",
    "title",
    "description",
    "category",
    "tags",
    "models",
    "location",
    "media",
    "permalink",
    "source_caption",
    "source_published_at",
    "is_featured",
    "sort_order",
    "created_at",
  ].join(",");
  const params = new URLSearchParams({
    select: columns,
    source: "eq.manual",
    is_published: "eq.true",
    source_active: "eq.true",
    order: "is_featured.desc,sort_order.asc,created_at.desc",
  });
  const rows = await fetchJson(`${SUPABASE_URL}/rest/v1/portfolio_posts?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });
  return Array.isArray(rows) ? rows.map(manualRowToProject).filter((project) => project.media.length) : [];
}

async function loadStaticContent() {
  return fetchJson("/portfolio/portfolio.json", { cache: "no-cache" });
}

async function loadInstagramProjects() {
  const feed = await fetchJson("/portfolio/instagram-feed.json", { cache: "no-cache" });
  if (!Array.isArray(feed?.projects)) return [];
  return feed.projects.map((project) => ({
    ...project,
    tags: tagsWithSourceLink(project.tags, String(project.instagramUrl || "").trim()),
    location: normalizeLocation(project.location),
    media: normalizeMedia(project.media, project.title),
  })).filter((project) => project.media.length);
}

export async function loadMergedPortfolio(fallbackContent) {
  const [staticResult, instagramResult, manualResult] = await Promise.allSettled([
    loadStaticContent(),
    loadInstagramProjects(),
    loadManualProjects(),
  ]);

  const base = staticResult.status === "fulfilled" ? staticResult.value : fallbackContent;
  const syncedInstagramProjects = instagramResult.status === "fulfilled" ? instagramResult.value : [];
  const manualProjects = manualResult.status === "fulfilled" ? manualResult.value : [];
  const staticProjects = Array.isArray(base.projects) ? base.projects : [];
  const instagramProjects = syncedInstagramProjects.length
    ? syncedInstagramProjects
    : buildScreenshotGridProjects(staticProjects);
  const cleanedStaticProjects = instagramProjects.length
    ? staticProjects.filter((project) => !/archive|아카이브/i.test(`${project?.title || ""} ${project?.category || ""}`))
    : staticProjects;

  return {
    ...base,
    projects: [...manualProjects, ...instagramProjects, ...cleanedStaticProjects],
  };
}
