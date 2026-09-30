import { getStore } from "@netlify/blobs";
import { jsonResponse, optionsResponse, parseJsonBody, requireAdmin } from "./_shared/data-utils.mjs";

const ALLOWED_EVENTS = new Set([
  "Page view", "Scroll depth", "CTA click", "Language change",
  "Image error", "Render error", "Web vitals",
  "Project open", "Project share", "Project link copied",
  "Kakao click", "Instagram click",
  "Inquiry review", "Inquiry sent", "Inquiry fallback",
]);
const ALLOWED_LANGUAGES = new Set(["ko", "ja", "en"]);
const MAX_PROP_COUNT = 12;

function getAnalyticsStore() {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN;
  return siteID && token ? getStore("portfolio-analytics", { siteID, token }) : getStore("portfolio-analytics");
}

function cleanText(value, max = 120) {
  return String(value || "").replace(/[\r\n\t]/g, " ").trim().slice(0, max);
}

function cleanProps(props) {
  if (!props || typeof props !== "object" || Array.isArray(props)) return {};
  return Object.fromEntries(Object.entries(props)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .slice(0, MAX_PROP_COUNT)
    .map(([key, value]) => [cleanText(key, 40), typeof value === "string" ? cleanText(value) : value]));
}

function cleanEvent(payload = {}) {
  const name = cleanText(payload.name, 80);
  if (!ALLOWED_EVENTS.has(name)) {
    const error = new Error("INVALID_EVENT_NAME");
    error.statusCode = 400;
    throw error;
  }

  const language = ALLOWED_LANGUAGES.has(payload.language) ? payload.language : "ko";
  const parsedTimestamp = Number.isNaN(Date.parse(payload.timestamp)) ? new Date() : new Date(payload.timestamp);
  const minimumTimestamp = Date.now() - 24 * 60 * 60 * 1000;
  const timestamp = new Date(Math.max(parsedTimestamp.getTime(), minimumTimestamp)).toISOString();
  const path = cleanText(payload.path, 240) || "/";
  return {
    name,
    path: path.startsWith("/") ? path : "/",
    language,
    referrer: cleanText(payload.referrer, 120),
    sessionId: cleanText(payload.sessionId, 80),
    props: cleanProps(payload.props),
    timestamp,
  };
}

function increment(target, key, amount = 1, limit = 100) {
  const safeKey = cleanText(key, 160) || "unknown";
  if (!(safeKey in target) && Object.keys(target).length >= limit) return;
  target[safeKey] = (target[safeKey] || 0) + amount;
}

async function readDay(store, date) {
  return (await store.get(`daily/${date}.json`, { type: "json", consistency: "strong" })) || {
    date,
    total: 0,
    events: {},
    paths: {},
    languages: {},
    referrers: {},
    performance: { samples: 0, lcpTotal: 0, clsTotal: 0, ttfbTotal: 0, loadTotal: 0 },
    updatedAt: null,
  };
}

async function writeEvent(event) {
  const date = event.timestamp.slice(0, 10);
  const store = getAnalyticsStore();
  const report = await readDay(store, date);
  report.total += 1;
  increment(report.events, event.name);
  increment(report.paths, event.path, 1, 200);
  increment(report.languages, event.language, 1, 10);
  if (event.referrer) increment(report.referrers, event.referrer, 1, 60);

  if (event.name === "Web vitals") {
    report.performance.samples += 1;
    report.performance.lcpTotal += Number(event.props.lcp) || 0;
    report.performance.clsTotal += Number(event.props.cls) || 0;
    report.performance.ttfbTotal += Number(event.props.ttfb) || 0;
    report.performance.loadTotal += Number(event.props.load) || 0;
  }

  report.updatedAt = new Date().toISOString();
  await store.setJSON(`daily/${date}.json`, report);
  return { ok: true };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return optionsResponse();

  if (event.httpMethod === "GET") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;
    try {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(event.queryStringParameters?.date || "")
        ? event.queryStringParameters.date
        : new Date().toISOString().slice(0, 10);
      const report = await readDay(getAnalyticsStore(), date);
      const samples = report.performance.samples || 0;
      return jsonResponse(200, {
        ...report,
        performanceAverage: samples ? {
          lcp: Math.round(report.performance.lcpTotal / samples),
          cls: Number((report.performance.clsTotal / samples).toFixed(3)),
          ttfb: Math.round(report.performance.ttfbTotal / samples),
          load: Math.round(report.performance.loadTotal / samples),
        } : null,
      });
    } catch (error) {
      return jsonResponse(500, { error: "ANALYTICS_READ_FAILED", message: error.message });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const rawLength = Buffer.byteLength(event.body || "", "utf8");
      if (rawLength > 16 * 1024) return jsonResponse(413, { error: "ANALYTICS_BODY_TOO_LARGE" });
      const analyticsEvent = cleanEvent(parseJsonBody(event));
      return jsonResponse(202, await writeEvent(analyticsEvent));
    } catch (error) {
      return jsonResponse(error.statusCode || 400, { error: "ANALYTICS_SAVE_FAILED", message: error.message });
    }
  }

  return jsonResponse(405, { error: "METHOD_NOT_ALLOWED" });
}
