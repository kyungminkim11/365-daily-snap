/**
 * 인스타그램 피드(public/portfolio/instagram-feed.json) → 관리자 스튜디오 프로젝트 변환 유틸.
 *
 * 관리자 페이지는 "수동 관리가 기본"이고, 인스타그램은 보조 수단이다.
 * 피드에서 고른 게시물만 이 변환을 거쳐 평범한 프로젝트로 편집 목록에 들어가고,
 * 이후 제목·카테고리·태그·사진 순서·삭제를 일반 프로젝트와 똑같이 다룰 수 있다.
 */

export const INSTAGRAM_HANDLE = "@365daily.snap";
export const DEFAULT_INSTAGRAM_CATEGORY = "인물 사진";

export const DEFAULT_INSTAGRAM_LOCATION = {
  city: "서울",
  district: "협의",
  place: "장소 미정",
  lat: "",
  lng: "",
  mapX: 50,
  mapY: 50,
};

/** 피드 항목에서 인스타그램 원본 게시물 ID만 뽑는다. (`instagram-<id>` 형태도 허용) */
export function instagramExternalId(post = {}) {
  const raw = String(post.externalId || post.id || "").trim();
  if (!raw) return "";
  return raw.replace(/^instagram-/, "");
}

/**
 * 이미 프로젝트로 가져온 인스타그램 게시물 ID 집합.
 * source 가 instagram 이거나 externalId 가 있는 프로젝트만 센다.
 * (일반 수동 프로젝트의 id 를 게시물 ID 로 오해하지 않도록)
 */
export function importedInstagramIds(projects = []) {
  const ids = new Set();
  (Array.isArray(projects) ? projects : []).forEach((project) => {
    const externalId = String(project?.externalId || "").trim().replace(/^instagram-/, "");
    if (externalId) {
      ids.add(externalId);
      return;
    }
    if (String(project?.source || "") === "instagram") {
      const id = String(project?.id || "").trim().replace(/^instagram-/, "");
      if (id) ids.add(id);
    }
  });
  return ids;
}

/** 가져온 프로젝트의 ID. 같은 게시물을 두 번 가져오지 않도록 식별자로 쓴다. */
export function instagramProjectId(post = {}) {
  const externalId = instagramExternalId(post);
  return externalId ? `instagram-${externalId}` : "";
}

/** 이미 프로젝트로 가져온 게시물인지 확인한다. */
export function isInstagramPostImported(projects = [], post = {}) {
  const externalId = instagramExternalId(post);
  if (!externalId) return false;
  const expectedProjectId = `instagram-${externalId}`;
  return (Array.isArray(projects) ? projects : []).some((project) => {
    const projectExternalId = String(project?.externalId || "").trim().replace(/^instagram-/, "");
    if (projectExternalId) return projectExternalId === externalId;
    return String(project?.id || "").trim() === expectedProjectId;
  });
}

function captionOf(post = {}) {
  return String(post.description || post.caption || post.sourceCaption || "").trim();
}

/** 캡션에서 해시태그만 뽑아낸다. (피드에 tags 가 없을 때 사용) */
export function instagramTags(post = {}) {
  const fromFeed = Array.isArray(post.tags)
    ? post.tags.map((tag) => String(tag || "").trim().replace(/^#/, "")).filter(Boolean)
    : [];
  if (fromFeed.length) return Array.from(new Set(fromFeed));
  const caption = captionOf(post);
  return Array.from(new Set((caption.match(/#[\p{L}\p{N}_]+/gu) || []).map((tag) => tag.slice(1)))).slice(0, 24);
}

/** 캡션 첫 줄(해시태그 제거) → 없으면 날짜 기반 제목. */
export function instagramTitle(post = {}) {
  const explicit = String(post.title || "").trim();
  if (explicit) return explicit.slice(0, 80);
  const firstLine = captionOf(post)
    .split(/\r?\n/)
    .map((line) => line.replace(/#[\p{L}\p{N}_]+/gu, "").trim())
    .find(Boolean);
  if (firstLine) return firstLine.slice(0, 80);
  return `Instagram · ${instagramDateLabel(post.sourcePublishedAt || post.timestamp)}`;
}

/** 2026.11.13 형태의 사람이 읽기 쉬운 날짜. */
export function instagramDateLabel(value = "") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/** 피드 목록에 보여줄 캡션 요약. */
export function instagramCaptionSummary(post = {}, maxLength = 120) {
  const caption = captionOf(post)
    .replace(/#[\p{L}\p{N}_]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!caption) return "캡션이 없는 게시물입니다.";
  return caption.length > maxLength ? `${caption.slice(0, maxLength).trim()}…` : caption;
}

function normalizeMedia(post = {}, instagramUrl = "", location = DEFAULT_INSTAGRAM_LOCATION) {
  const media = Array.isArray(post.media) ? post.media : [];
  return media
    .map((item, index) => ({
      type: item?.type === "video" ? "video" : "image",
      src: String(item?.src || item?.image || "").trim(),
      thumbnail: "",
      alt: String(item?.alt || post.title || "").trim() || `인스타그램 사진 ${index + 1}`,
      caption: String(item?.caption || "").trim(),
      tags: [],
      models: [],
      location,
      instagramUrl,
      externalId: String(item?.externalId || ""),
    }))
    .filter((item) => item.src);
}

/**
 * 인스타그램 피드 게시물 하나를 관리자 스튜디오 프로젝트로 바꾼다.
 * @param {object} post instagram-feed.json 의 projects[] 항목
 * @param {{category?: string, status?: string, location?: object}} options
 * @returns {object|null} 사진이 없으면 null
 */
export function buildInstagramProject(post = {}, options = {}) {
  const id = instagramProjectId(post);
  if (!id) return null;

  const instagramUrl = String(post.instagramUrl || post.permalink || "").trim();
  const location = options.location || post.location || DEFAULT_INSTAGRAM_LOCATION;
  const media = normalizeMedia(post, instagramUrl, location);
  if (!media.length) return null;

  const description = captionOf(post);
  const title = instagramTitle(post);

  return {
    id,
    source: "instagram",
    externalId: instagramExternalId(post),
    title,
    subtitle: String(post.subtitle || INSTAGRAM_HANDLE).trim() || INSTAGRAM_HANDLE,
    description,
    category: String(options.category || "").trim() || DEFAULT_INSTAGRAM_CATEGORY,
    // 가져온 직후에는 임시저장으로 두고, 확인 후 공개로 바꾸게 한다.
    status: ["published", "draft", "private", "featured"].includes(options.status) ? options.status : "draft",
    tags: instagramTags(post),
    models: Array.isArray(post.models) ? post.models.map((model) => String(model || "").trim()).filter(Boolean) : [],
    location,
    cover: media[0].src,
    media,
    instagramUrl,
    sourcePublishedAt: String(post.sourcePublishedAt || post.timestamp || "").trim(),
  };
}
