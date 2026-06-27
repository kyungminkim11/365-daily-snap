(() => {
  const NETLIFY_API_ORIGIN = "https://365dailysnap.netlify.app";
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input?.url;

    if (!rawUrl) {
      return originalFetch(input, init);
    }

    const url = new URL(rawUrl, window.location.origin);
    const method = String(init.method || (typeof input !== "string" && input?.method) || "GET").toUpperCase();

    if (url.origin === window.location.origin && url.pathname === "/api/content" && method === "GET") {
      const staticUrl = new URL("/portfolio/portfolio.json", window.location.origin);
      staticUrl.searchParams.set("updated", Date.now().toString());
      return originalFetch(staticUrl.toString(), { ...init, cache: "no-store" });
    }

    if (url.origin === window.location.origin && url.pathname.startsWith("/api/")) {
      const backendUrl = `${NETLIFY_API_ORIGIN}${url.pathname}${url.search}`;
      return originalFetch(backendUrl, init);
    }

    return originalFetch(input, init);
  };
})();
