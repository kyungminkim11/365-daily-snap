import {
  cleanInquiry,
  jsonResponse,
  optionsResponse,
  parseJsonBody,
  readInquiries,
  requireAdmin,
  writeInquiries,
} from "./_shared/data-utils.mjs";

function cleanString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }

  if (event.httpMethod === "GET") {
    const unauthorized = requireAdmin(event);

    if (unauthorized) {
      return unauthorized;
    }

    try {
      return jsonResponse(200, await readInquiries());
    } catch (error) {
      return jsonResponse(500, { error: "INQUIRY_READ_FAILED", message: error.message });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const inquiry = await cleanInquiry(parseJsonBody(event));

      if (!inquiry.contact && !Object.values(inquiry.contacts || {}).some(Boolean) && !inquiry.message) {
        return jsonResponse(400, { error: "INQUIRY_INVALID", message: "연락처 또는 문의 내용을 입력해주세요." });
      }

      const inquiries = await readInquiries();
      inquiries.unshift(inquiry);
      await writeInquiries(inquiries);

      return jsonResponse(200, { ok: true, inquiry });
    } catch (error) {
      return jsonResponse(error.statusCode || 400, { error: "INQUIRY_SAVE_FAILED", message: error.message });
    }
  }

  if (event.httpMethod === "PATCH") {
    const unauthorized = requireAdmin(event);

    if (unauthorized) {
      return unauthorized;
    }

    try {
      const payload = parseJsonBody(event);
      const inquiries = await readInquiries();
      const nextInquiries = inquiries.map((inquiry) =>
        inquiry.id === payload.id ? { ...inquiry, status: cleanString(payload.status, inquiry.status) } : inquiry,
      );

      await writeInquiries(nextInquiries);
      return jsonResponse(200, nextInquiries);
    } catch (error) {
      return jsonResponse(error.statusCode || 400, { error: "INQUIRY_UPDATE_FAILED", message: error.message });
    }
  }

  if (event.httpMethod === "DELETE") {
    const unauthorized = requireAdmin(event);

    if (unauthorized) {
      return unauthorized;
    }

    try {
      const id = event.queryStringParameters?.id;
      const inquiries = await readInquiries();
      const nextInquiries = inquiries.filter((inquiry) => inquiry.id !== id);

      await writeInquiries(nextInquiries);
      return jsonResponse(200, nextInquiries);
    } catch (error) {
      return jsonResponse(400, { error: "INQUIRY_DELETE_FAILED", message: error.message });
    }
  }

  return jsonResponse(405, { error: "METHOD_NOT_ALLOWED" });
}
