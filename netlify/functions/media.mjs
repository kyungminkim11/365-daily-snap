import { getMediaStore, jsonResponse, optionsResponse } from "./_shared/data-utils.mjs";

function getMediaKey(event) {
  const queryKey = event.queryStringParameters?.key;

  if (queryKey) {
    return queryKey.replace(/^\/+/, "");
  }

  return String(event.path || "")
    .replace(/^\/api\/media\/?/, "")
    .replace(/^\/\.netlify\/functions\/media\/?/, "")
    .replace(/^\/+/, "");
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "METHOD_NOT_ALLOWED" });
  }

  const key = getMediaKey(event);

  if (!key) {
    return jsonResponse(400, { error: "MEDIA_KEY_MISSING" });
  }

  try {
    const store = getMediaStore();
    const entry = await store.getWithMetadata(key, { type: "arrayBuffer", consistency: "strong" });

    if (!entry?.data) {
      return jsonResponse(404, { error: "MEDIA_NOT_FOUND" });
    }

    const buffer = Buffer.from(entry.data);
    const mimeType = entry.metadata?.mimeType || "application/octet-stream";

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: buffer.toString("base64"),
    };
  } catch (error) {
    return jsonResponse(500, { error: "MEDIA_READ_FAILED", message: error.message });
  }
}
