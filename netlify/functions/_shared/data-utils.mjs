import { getStore } from "@netlify/blobs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_KEY = "portfolio.json";
const INQUIRIES_KEY = "inquiries.json";
const MAX_BODY_BYTES = 320 * 1024 * 1024;

export function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(payload, null, 2),
  };
}

export function optionsResponse() {
  return {
    statusCode: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    },
    body: "",
  };
}

export function requireAdmin(event) {
  const expectedToken = process.env.NETLIFY_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return jsonResponse(500, {
      error: "ADMIN_TOKEN_MISSING",
      message: "Netlify 환경 변수 NETLIFY_ADMIN_TOKEN을 먼저 설정해주세요.",
    });
  }

  const providedToken = event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"];

  if (providedToken !== expectedToken) {
    return jsonResponse(401, {
      error: "ADMIN_UNAUTHORIZED",
      message: "관리자 토큰이 필요합니다.",
    });
  }

  return null;
}

export function parseJsonBody(event) {
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || "{}";

  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    const error = new Error("BODY_TOO_LARGE");
    error.statusCode = 413;
    throw error;
  }

  return JSON.parse(rawBody);
}

function getBlobStoreOptions() {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN;

  return siteID && token ? { siteID, token } : undefined;
}

function getBlobStore(name) {
  const options = getBlobStoreOptions();
  return options ? getStore(name, options) : getStore(name);
}

function getContentStore() {
  return getBlobStore("portfolio-content");
}

function getInquiryStore() {
  return getBlobStore("portfolio-inquiries");
}

export function getMediaStore() {
  return getBlobStore("portfolio-media");
}

async function readStaticContent() {
  const candidates = [
    path.join(process.cwd(), "public", "portfolio", "portfolio.json"),
    path.join(process.cwd(), "dist", "portfolio", "portfolio.json"),
  ];

  for (const filePath of candidates) {
    try {
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch {
      // Try the next deploy location.
    }
  }

  return {};
}

export async function readContent() {
  const stored = await getContentStore().get(CONTENT_KEY, { type: "json", consistency: "strong" });
  return stored || (await readStaticContent());
}

export async function writeContent(content) {
  await getContentStore().setJSON(CONTENT_KEY, content);
  return content;
}

export async function readInquiries() {
  return (await getInquiryStore().get(INQUIRIES_KEY, { type: "json", consistency: "strong" })) || [];
}

export async function writeInquiries(inquiries) {
  await getInquiryStore().setJSON(INQUIRIES_KEY, inquiries);
  return inquiries;
}

function slugify(value) {
  return String(value || "portfolio")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

function cleanString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanNumber(value, fallback = "") {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampMapValue(value, fallback = 50) {
  const number = cleanNumber(value, fallback);
  return Math.min(92, Math.max(8, number));
}

function cleanTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => cleanString(tag)).filter(Boolean);
  }

  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function cleanModelNames(models) {
  return cleanTags(models);
}

function cleanLocation(location = {}) {
  return {
    city: cleanString(location.city, "서울") || "서울",
    district: cleanString(location.district, "마포구") || "마포구",
    place: cleanString(location.place, "장소 미정") || "장소 미정",
    lat: cleanNumber(location.lat),
    lng: cleanNumber(location.lng),
    mapX: clampMapValue(location.mapX),
    mapY: clampMapValue(location.mapY),
  };
}

function getDataUrlInfo(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);

  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const type = mimeType.startsWith("video/") ? "video" : "image";
  const subtype = mimeType.split("/")[1];
  const extensionMap = {
    jpeg: "jpg",
    jpg: "jpg",
    mpeg: "mpeg",
    mp4: "mp4",
    ogg: "ogg",
    png: "png",
    quicktime: "mov",
    webm: "webm",
    webp: "webp",
    "x-m4v": "m4v",
  };

  return {
    base64,
    extension: extensionMap[subtype] || subtype.replace(/[^a-z0-9]/g, ""),
    mimeType,
    type,
  };
}

function inferMediaType(src = "", fallback = "image") {
  const value = String(src).toLowerCase();

  if (/\.(mp4|m4v|mov|webm|ogg)(\?|#|$)/.test(value)) {
    return "video";
  }

  return fallback === "video" ? "video" : "image";
}

export async function saveDataUrl(dataUrl, nameParts, prefix = "portfolio/uploads") {
  const info = getDataUrlInfo(dataUrl);

  if (!info) {
    return null;
  }

  const fileName = `${Date.now()}-${nameParts.map(slugify).filter(Boolean).join("-")}.${info.extension}`;
  const key = `${prefix}/${fileName}`;
  const buffer = Buffer.from(info.base64, "base64");
  const value = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  await getMediaStore().set(key, value, {
    metadata: {
      mimeType: info.mimeType,
      type: info.type,
    },
  });

  return {
    src: `/api/media/${key}`,
    type: info.type,
    mimeType: info.mimeType,
  };
}

async function cleanPortfolioItem(item, index) {
  const nextItem = {
    ...item,
    category: cleanString(item.category),
    title: cleanString(item.title),
    description: cleanString(item.description),
    image: cleanString(item.image),
    tags: cleanTags(item.tags),
    models: cleanModelNames(item.models),
    location: cleanLocation(item.location),
  };

  if (item.imageDataUrl) {
    const saved = await saveDataUrl(item.imageDataUrl, ["photo", index + 1, item.title || item.category]);

    if (saved) {
      nextItem.image = saved.src;
    }
  }

  delete nextItem.imageDataUrl;
  return nextItem;
}

async function cleanProjectMedia(media, projectIndex, mediaIndex, projectTitle) {
  const saved = media.mediaDataUrl
    ? await saveDataUrl(media.mediaDataUrl, ["project", projectIndex + 1, mediaIndex + 1, media.title || projectTitle])
    : null;
  const src = saved?.src || cleanString(media.src || media.image);
  const type = saved?.type || inferMediaType(src, media.type);

  return {
    type,
    src,
    alt: cleanString(media.alt || media.title || projectTitle),
    caption: cleanString(media.caption || media.description),
    tags: cleanTags(media.tags),
    models: cleanModelNames(media.models),
    location: cleanLocation(media.location),
    instagramUrl: cleanString(media.instagramUrl),
  };
}

async function cleanProject(project, index) {
  const title = cleanString(project.title, `Project ${index + 1}`) || `Project ${index + 1}`;
  const media = Array.isArray(project.media)
    ? await Promise.all(project.media.map((item, mediaIndex) => cleanProjectMedia(item, index, mediaIndex, title)))
    : [];
  const coverSaved = project.coverDataUrl ? await saveDataUrl(project.coverDataUrl, ["project-cover", index + 1, title]) : null;
  const coverFromInlineData = getDataUrlInfo(project.cover) ? await saveDataUrl(project.cover, ["project-cover", index + 1, title]) : null;
  const explicitCover = getDataUrlInfo(project.cover) ? "" : cleanString(project.cover);
  const cover = coverSaved?.src || coverFromInlineData?.src || explicitCover || media.find((item) => item.src)?.src || "";

  return {
    id: cleanString(project.id) || `${slugify(title)}-${Date.now()}-${index}`,
    title,
    subtitle: cleanString(project.subtitle),
    description: cleanString(project.description),
    category: cleanString(project.category, "Portrait Project") || "Portrait Project",
    tags: cleanTags(project.tags),
    models: cleanModelNames(project.models),
    location: cleanLocation(project.location),
    cover,
    media,
  };
}

function cleanModel(model = {}) {
  return {
    name: cleanString(model.name),
    url: cleanString(model.url),
    note: cleanString(model.note),
  };
}

function cleanTaxonomy(taxonomy = {}) {
  return {
    categories: cleanTags(taxonomy.categories),
    tags: cleanTags(taxonomy.tags),
    locations: Array.isArray(taxonomy.locations) ? taxonomy.locations.map(cleanLocation) : [],
  };
}

function cleanShootingProcess(process = {}) {
  return {
    title: cleanString(process.title),
    description: cleanString(process.description),
    ctaLabel: cleanString(process.ctaLabel),
    steps: Array.isArray(process.steps)
      ? process.steps
          .map((step, index) => ({
            number: cleanString(step.number, String(index + 1).padStart(2, "0")),
            icon: cleanString(step.icon),
            title: cleanString(step.title),
            description: cleanString(step.description),
          }))
          .filter((step) => step.title && step.description)
      : [],
  };
}

function cleanTestimonials(testimonials = []) {
  return Array.isArray(testimonials)
    ? testimonials
        .map((testimonial) => ({
          name: cleanString(testimonial.name),
          handle: cleanString(testimonial.handle || testimonial.name),
          date: cleanString(testimonial.date),
          type: cleanString(testimonial.type),
          content: cleanString(testimonial.content),
          reviewImage: cleanString(testimonial.reviewImage || testimonial.image),
          imageAlt: cleanString(testimonial.imageAlt),
        }))
        .filter((testimonial) => testimonial.name && testimonial.content)
    : [];
}

export async function cleanContent(content) {
  const nextContent = {
    ...content,
    portfolioFilters: Array.isArray(content.portfolioFilters)
      ? content.portfolioFilters.map((filter) => cleanString(filter)).filter(Boolean)
      : [],
    portfolioItems: Array.isArray(content.portfolioItems) ? content.portfolioItems : [],
    projects: Array.isArray(content.projects) ? content.projects : [],
    models: Array.isArray(content.models) ? content.models.map(cleanModel).filter((model) => model.name) : [],
    taxonomy: cleanTaxonomy(content.taxonomy),
    shootingProcess: cleanShootingProcess(content.shootingProcess),
    testimonialsIntro: {
      title: cleanString(content.testimonialsIntro?.title),
      description: cleanString(content.testimonialsIntro?.description),
      ctaLabel: cleanString(content.testimonialsIntro?.ctaLabel),
    },
    testimonials: cleanTestimonials(content.testimonials),
  };

  nextContent.portfolioItems = await Promise.all(nextContent.portfolioItems.map(cleanPortfolioItem));
  nextContent.projects = await Promise.all(nextContent.projects.map(cleanProject));

  return nextContent;
}

function cleanContacts(contacts = {}) {
  return {
    instagram: cleanString(contacts.instagram),
    phone: cleanString(contacts.phone),
    kakaoId: cleanString(contacts.kakaoId),
    email: cleanString(contacts.email),
  };
}

async function cleanInquiryReference(image = {}, index = 0) {
  const saved = image.dataUrl
    ? await saveDataUrl(image.dataUrl, ["reference", index + 1, image.name || "image"], "inquiries/references")
    : null;

  return {
    name: cleanString(image.name, `reference-${index + 1}`),
    size: cleanNumber(image.size),
    type: cleanString(image.type || saved?.mimeType),
    src: saved?.src || cleanString(image.src),
  };
}

export async function cleanInquiry(payload = {}) {
  const now = new Date().toISOString();
  const referenceImages = Array.isArray(payload.referenceImages)
    ? (await Promise.all(payload.referenceImages.slice(0, 6).map(cleanInquiryReference))).filter((image) => image.src)
    : [];

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    status: "new",
    name: cleanString(payload.name, "이름 미입력") || "이름 미입력",
    contact: cleanString(payload.contact),
    contacts: cleanContacts(payload.contacts),
    contactMethod: cleanString(payload.contactMethod, "연락 수단 미정"),
    inquiryType: cleanString(payload.inquiryType),
    shootType: cleanString(payload.shootType),
    preferredDate: cleanString(payload.preferredDate),
    preferredDates: cleanTags(payload.preferredDates),
    preferredDateNote: cleanString(payload.preferredDateNote),
    preferredTimeSlots: cleanTags(payload.preferredTimeSlots),
    area: cleanString(payload.area),
    preferredLocations: cleanTags(payload.preferredLocations),
    customLocation: cleanString(payload.customLocation),
    departureArea: cleanString(payload.departureArea),
    mood: cleanTags(payload.mood),
    moodNote: cleanString(payload.moodNote),
    people: cleanString(payload.people),
    usage: cleanString(payload.usage),
    privacy: cleanString(payload.privacy),
    referenceImages,
    message: cleanString(payload.message),
    page: cleanString(payload.page),
  };
}
