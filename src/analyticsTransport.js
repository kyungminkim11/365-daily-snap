const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

function isAnalyticsPost(input, init = {}) {
  const method = String(init.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "POST") return false;
  try {
    const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
    return url.origin === window.location.origin && url.pathname === "/api/analytics";
  } catch {
    return false;
  }
}

function readPayload(input, init = {}) {
  if (typeof init.body === "string") {
    try { return Promise.resolve(JSON.parse(init.body)); } catch { return Promise.resolve(null); }
  }
  if (input instanceof Request) {
    return input.clone().json().catch(() => null);
  }
  return Promise.resolve(null);
}

export function installAnalyticsTransport() {
  if (typeof window === "undefined" || window.__snapAnalyticsTransportInstalled) return;
  window.__snapAnalyticsTransportInstalled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function analyticsAwareFetch(input, init = {}) {
    if (!isAnalyticsPost(input, init) || !SUPABASE_URL || !SUPABASE_KEY) {
      return originalFetch(input, init);
    }

    const payload = await readPayload(input, init);
    if (!payload) return originalFetch(input, init);

    try {
      const response = await originalFetch(`${SUPABASE_URL}/rest/v1/rpc/record_site_event`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
        keepalive: true,
      });
      if (response.ok) return response;
    } catch {
      // Fall back to the hosting provider's analytics endpoint below.
    }

    return originalFetch(input, init);
  };
}
