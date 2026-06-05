import { cleanContent, jsonResponse, optionsResponse, parseJsonBody, readContent, requireAdmin, writeContent } from "./_shared/data-utils.mjs";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }

  if (event.httpMethod === "GET") {
    try {
      return jsonResponse(200, await readContent());
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
