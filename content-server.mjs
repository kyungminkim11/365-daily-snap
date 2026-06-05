import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.CONTENT_PORT ?? 5174);
const HOST = process.env.CONTENT_HOST ?? "0.0.0.0";
const dataDir = path.join(__dirname, "public", "portfolio");
const uploadDir = path.join(dataDir, "uploads");
const contentPath = path.join(dataDir, "portfolio.json");
const inquiriesDir = path.join(__dirname, "public", "inquiries");
const inquiryReferenceDir = path.join(inquiriesDir, "references");
const inquiriesPath = path.join(inquiriesDir, "inquiries.json");
const maxBodyBytes = 320 * 1024 * 1024;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendOptions(response) {
  response.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end();
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

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > maxBodyBytes) {
        reject(new Error("BODY_TOO_LARGE"));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

async function readJsonFile(filePath, fallback) {
  if (!existsSync(filePath)) {
    return fallback;
  }

  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
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
    "x-m4v": "m4v",
    mp4: "mp4",
    mpeg: "mpeg",
    ogg: "ogg",
    quicktime: "mov",
    webm: "webm",
    png: "png",
    jpg: "jpg",
    webp: "webp",
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

async function saveDataUrl(dataUrl, nameParts) {
  const info = getDataUrlInfo(dataUrl);

  if (!info) {
    return null;
  }

  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${nameParts.map(slugify).filter(Boolean).join("-")}.${info.extension}`;
  const absolutePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(info.base64, "base64");

  await writeFile(absolutePath, buffer);

  return {
    src: `/portfolio/uploads/${fileName}`,
    type: info.type,
    mimeType: info.mimeType,
  };
}

async function saveInquiryReferenceDataUrl(dataUrl, nameParts) {
  const info = getDataUrlInfo(dataUrl);

  if (!info || info.type !== "image") {
    return null;
  }

  await mkdir(inquiryReferenceDir, { recursive: true });

  const fileName = `${Date.now()}-${nameParts.map(slugify).filter(Boolean).join("-")}.${info.extension}`;
  const absolutePath = path.join(inquiryReferenceDir, fileName);
  const buffer = Buffer.from(info.base64, "base64");

  await writeFile(absolutePath, buffer);

  return {
    src: `/inquiries/references/${fileName}`,
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
  };
}

async function cleanProject(project, index) {
  const title = cleanString(project.title, `Project ${index + 1}`) || `Project ${index + 1}`;
  const media = Array.isArray(project.media)
    ? await Promise.all(project.media.map((item, mediaIndex) => cleanProjectMedia(item, index, mediaIndex, title)))
    : [];
  const coverSaved = project.coverDataUrl
    ? await saveDataUrl(project.coverDataUrl, ["project-cover", index + 1, title])
    : null;
  const coverFromInlineData = getDataUrlInfo(project.cover)
    ? await saveDataUrl(project.cover, ["project-cover", index + 1, title])
    : null;
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

async function cleanContent(content) {
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

function cleanInquiry(payload = {}) {
  const now = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    status: "new",
    name: cleanString(payload.name, "이름 미입력") || "이름 미입력",
    contact: cleanString(payload.contact),
    contactMethod: cleanString(payload.contactMethod, "카카오톡/인스타그램"),
    shootType: cleanString(payload.shootType),
    preferredDate: cleanString(payload.preferredDate),
    area: cleanString(payload.area),
    people: cleanString(payload.people),
    message: cleanString(payload.message),
    page: cleanString(payload.page),
  };
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
  const saved = image.dataUrl ? await saveInquiryReferenceDataUrl(image.dataUrl, ["reference", index + 1, image.name || "image"]) : null;

  return {
    name: cleanString(image.name, `reference-${index + 1}`),
    size: cleanNumber(image.size),
    type: cleanString(image.type || saved?.mimeType),
    src: saved?.src || cleanString(image.src),
  };
}

async function cleanInquiryV2(payload = {}) {
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

async function readInquiries() {
  return readJsonFile(inquiriesPath, []);
}

async function writeInquiries(inquiries) {
  await mkdir(inquiriesDir, { recursive: true });
  await writeFile(inquiriesPath, `${JSON.stringify(inquiries, null, 2)}\n`, "utf8");
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendOptions(response);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/content") {
    try {
      sendJson(response, 200, await readJsonFile(contentPath, {}));
    } catch (error) {
      sendJson(response, 500, { error: "CONTENT_READ_FAILED", message: error.message });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/content") {
    try {
      const rawBody = await readRequestBody(request);
      const content = JSON.parse(rawBody);
      const nextContent = await cleanContent(content);

      await mkdir(dataDir, { recursive: true });
      await writeFile(contentPath, `${JSON.stringify(nextContent, null, 2)}\n`, "utf8");

      sendJson(response, 200, nextContent);
    } catch (error) {
      const statusCode = error.message === "BODY_TOO_LARGE" ? 413 : 400;
      sendJson(response, statusCode, { error: "CONTENT_SAVE_FAILED", message: error.message });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/inquiries") {
    try {
      const inquiries = await readInquiries();
      sendJson(response, 200, inquiries);
    } catch (error) {
      sendJson(response, 500, { error: "INQUIRY_READ_FAILED", message: error.message });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/inquiries") {
    try {
      const rawBody = await readRequestBody(request);
      const inquiry = await cleanInquiryV2(JSON.parse(rawBody));

      if (!inquiry.contact && !Object.values(inquiry.contacts || {}).some(Boolean) && !inquiry.message) {
        sendJson(response, 400, { error: "INQUIRY_INVALID", message: "연락처 또는 문의 내용을 입력해주세요." });
        return;
      }

      const inquiries = await readInquiries();
      inquiries.unshift(inquiry);
      await writeInquiries(inquiries);

      sendJson(response, 200, { ok: true, inquiry });
    } catch (error) {
      sendJson(response, 400, { error: "INQUIRY_SAVE_FAILED", message: error.message });
    }
    return;
  }

  if (request.method === "PATCH" && requestUrl.pathname === "/api/inquiries") {
    try {
      const rawBody = await readRequestBody(request);
      const payload = JSON.parse(rawBody);
      const inquiries = await readInquiries();
      const nextInquiries = inquiries.map((inquiry) =>
        inquiry.id === payload.id ? { ...inquiry, status: cleanString(payload.status, inquiry.status) } : inquiry,
      );

      await writeInquiries(nextInquiries);
      sendJson(response, 200, nextInquiries);
    } catch (error) {
      sendJson(response, 400, { error: "INQUIRY_UPDATE_FAILED", message: error.message });
    }
    return;
  }

  if (request.method === "DELETE" && requestUrl.pathname === "/api/inquiries") {
    try {
      const id = requestUrl.searchParams.get("id");
      const inquiries = await readInquiries();
      const nextInquiries = inquiries.filter((inquiry) => inquiry.id !== id);

      await writeInquiries(nextInquiries);
      sendJson(response, 200, nextInquiries);
    } catch (error) {
      sendJson(response, 400, { error: "INQUIRY_DELETE_FAILED", message: error.message });
    }
    return;
  }

  sendJson(response, 404, { error: "NOT_FOUND" });
}

createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    sendJson(response, 500, { error: "SERVER_ERROR", message: error.message });
  });
}).listen(PORT, HOST, () => {
  console.log(`365 Daily Snap content server: http://${HOST}:${PORT}`);
});
