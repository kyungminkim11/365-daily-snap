import { cleanContent, jsonResponse, optionsResponse, parseJsonBody, readContent, requireAdmin, writeContent } from "./_shared/data-utils.mjs";

function hasAdminToken(event) {
  return !requireAdmin(event);
}

function isPublicProject(project = {}) {
  const status = String(project.status || "published").toLowerCase();
  return status === "published" || status === "featured" || status === "";
}

function publicContent(content = {}) {
  const publicProjects = Array.isArray(content.projects) ? content.projects.filter(isPublicProject) : [];
  const publicItems = Array.isArray(content.portfolioItems)
    ? content.portfolioItems.filter((item) => {
        const status = String(item.status || "published").toLowerCase();
        return status === "published" || status === "featured" || status === "";
      })
    : [];

  return {
    ...content,
    projects: publicProjects,
    portfolioItems: publicItems,
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }

  if (event.httpMethod === "GET") {
    try {
      const content = await readContent();
      return jsonResponse(200, hasAdminToken(event) ? content : publicContent(content));
    } catch (error) {
      return jsonResponse(500, { error: "CONTENT_READ_FAILED", message: error.message });
    }
  }

  if (event.httpMethod === "POST") {
    const unauthorized = requireAdmin(event);

    if (unauthorized) {
      return unauthorized;
    }

    try {
      const content = parseJsonBody(event);
      const nextContent = await cleanContent(content);
      await writeContent(nextContent);
      return jsonResponse(200, nextContent);
    } catch (error) {
      return jsonResponse(error.statusCode || 400, { error: "CONTENT_SAVE_FAILED", message: error.message });
    }
  }

  return jsonResponse(405, { error: "METHOD_NOT_ALLOWED" });
}
