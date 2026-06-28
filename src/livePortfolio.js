const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const HIDDEN_LOCATION = { city: "협의", district: "미정", place: "확인 필요", mapX: 50, mapY: 50 };

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

function normalizeMedia(media, fallbackTitle) {
  if (!Array.isArray(media)) return [];
  return media
    .map((item) => ({
      type: item?.type === "video" ? "video" : "image",
      src: String(item?.src || item?.image || "").trim(),
      alt: String(item?.alt || fallbackTitle || "365 Daily Snap").trim(),
      caption: String(item?.caption || "").trim(),
      tags: Array.isArray(item?.tags) ? item.tags : [],
      models: Array.isArray(item?.models) ? item.models : [],
      location: normalizeLocation(item?.location),
      instagramUrl: String(item?.instagramUrl || "").trim(),
      externalId: String(item?.externalId || "").trim(),
    }))
    .filter((item) => item.src);
}

function manualRowToProject(row) {
  const title = String(row.title || "촬영 기록").trim();
  const media = normalizeMedia(row.media, title);
  return {
    id: `cms-${row.id}`,
    source: row.source || "manual",
    externalId: String(row.external_id || row.id),
    title,
    subtitle: row.source === "instagram" ? "@365daily.snap" : "365 Daily Snap",
    description: String(row.description || row.source_caption || "").trim(),
    category: String(row.category || "인물 사진").trim(),
    tags: Array.isArray(row.tags) ? row.tags : [],
    models: Array.isArray(row.models) ? row.models : [],
    location: normalizeLocation(row.location),
    cover: media[0]?.src || "",
    media,
    instagramUrl: String(row.permalink || "").trim(),
    sourcePublishedAt: row.source_published_at || row.created_at || "",
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order || 1000),
  };
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
  const instagramProjects = instagramResult.status === "fulfilled" ? instagramResult.value : [];
  const manualProjects = manualResult.status === "fulfilled" ? manualResult.value : [];
  const staticProjects = Array.isArray(base.projects) ? base.projects : [];
  const cleanedStaticProjects = instagramProjects.length
    ? staticProjects.filter((project) => !/archive|아카이브/i.test(`${project?.title || ""} ${project?.category || ""}`))
    : staticProjects;

  return {
    ...base,
    projects: [...manualProjects, ...instagramProjects, ...cleanedStaticProjects],
  };
}
