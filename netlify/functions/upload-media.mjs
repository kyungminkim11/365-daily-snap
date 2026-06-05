import { jsonResponse, optionsResponse, parseJsonBody, requireAdmin, saveDataUrl } from "./_shared/data-utils.mjs";

const ALLOWED_PREFIXES = new Set(["portfolio/uploads", "inquiries/references"]);

function cleanString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanNameParts(value) {
  if (Array.isArray(value)) {
    return value.map((part) => cleanString(part)).filter(Boolean).slice(0, 6);
  }

  return [cleanString(value, "upload")].filter(Boolean);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "METHOD_NOT_ALLOWED" });
  }

  const unauthorized = requireAdmin(event);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = parseJsonBody(event);
    const prefix = ALLOWED_PREFIXES.has(payload.prefix) ? payload.prefix : "portfolio/uploads";
    const saved = await saveDataUrl(payload.dataUrl, cleanNameParts(payload.nameParts), prefix);

    if (!saved?.src) {
      return jsonResponse(400, { error: "UPLOAD_INVALID", message: "업로드할 파일 데이터를 확인해주세요." });
    }

    return jsonResponse(200, saved);
  } catch (error) {
    return jsonResponse(error.statusCode || 400, { error: "UPLOAD_FAILED", message: error.message });
  }
}
