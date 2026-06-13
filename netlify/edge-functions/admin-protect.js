const PROTECTED_PATHS = [
  "/admin",
  "/admin.html",
  "/admin-v2.html",
  "/manager",
  "/api/content",
  "/api/inquiries",
  "/api/upload-media",
];

function isProtectedPath(pathname) {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function safeEqual(left = "", right = "") {
  if (!left || !right || left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function getBearerToken(request) {
  const value = request.headers.get("x-admin-token") || "";
  return value.trim();
}

function getBasicPassword(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("basic ")) return "";

  try {
    const decoded = atob(authorization.slice(6));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return "";
    return decoded.slice(separatorIndex + 1);
  } catch {
    return "";
  }
}

function unauthorized() {
  return new Response("관리자 인증이 필요합니다.", {
    status: 401,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "www-authenticate": 'Basic realm="365 Daily Snap Admin", charset="UTF-8"',
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  if (!isProtectedPath(url.pathname)) return context.next();

  const adminKey = Netlify.env.get("NETLIFY_ADMIN_TOKEN") || "";
  if (!adminKey) {
    return new Response("관리자 인증 설정이 필요합니다.", {
      status: 503,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  const apiKey = getBearerToken(request);
  const browserPassword = getBasicPassword(request);

  if (safeEqual(apiKey, adminKey) || safeEqual(browserPassword, adminKey)) {
    const response = await context.next();
    response.headers.set("cache-control", "no-store");
    response.headers.set("x-robots-tag", "noindex, nofollow");
    return response;
  }

  return unauthorized();
};

export const config = {
  path: [
    "/admin",
    "/admin/*",
    "/admin.html",
    "/admin-v2.html",
    "/manager",
    "/manager/*",
    "/api/content",
    "/api/inquiries",
    "/api/upload-media",
  ],
};
