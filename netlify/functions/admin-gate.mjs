import { readFile } from "node:fs/promises";
import path from "node:path";

function getExpectedKey() {
  return process.env.NETLIFY_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "";
}

function timingSafeEqualString(left = "", right = "") {
  if (!left || !right || left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function getBasicPassword(event) {
  const authorization = event.headers?.authorization || event.headers?.Authorization || "";
  if (!authorization.toLowerCase().startsWith("basic ")) return "";

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return "";
    return decoded.slice(separatorIndex + 1);
  } catch {
    return "";
  }
}

function getHeaderKey(event) {
  return event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"] || "";
}

function unauthorized() {
  return {
    statusCode: 401,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "WWW-Authenticate": 'Basic realm="365 Daily Snap Admin", charset="UTF-8"',
    },
    body: "관리자 인증이 필요합니다.",
  };
}

async function readAdminPage() {
  const candidates = [
    path.join(process.cwd(), "public", "admin-v2.html"),
    path.join(process.cwd(), "dist", "admin-v2.html"),
    path.join(process.cwd(), "admin-v2.html"),
  ];

  for (const filePath of candidates) {
    try {
      return await readFile(filePath, "utf8");
    } catch {
      // Try next deploy path.
    }
  }

  throw new Error("ADMIN_PAGE_NOT_FOUND");
}

export async function handler(event) {
  const expectedKey = getExpectedKey();
  if (!expectedKey) {
    return {
      statusCode: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
      body: "관리자 인증 설정이 필요합니다.",
    };
  }

  const providedKey = getHeaderKey(event) || getBasicPassword(event);
  if (!timingSafeEqualString(providedKey, expectedKey)) {
    return unauthorized();
  }

  try {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
      body: await readAdminPage(),
    };
  } catch {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
      body: "관리자 페이지를 불러오지 못했습니다.",
    };
  }
}
