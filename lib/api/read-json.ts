/**
 * Parse untrusted JSON with a strict byte limit before materializing the body.
 * The limit applies to decoded request bytes, not just the Content-Length header.
 */
export type JsonBodyResult =
  | { success: true; value: unknown }
  | { success: false; status: 400 | 413 | 415; message: string };

export const MAX_JSON_BODY_BYTES = 1_048_576;

export async function readJsonBody(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json" && !contentType?.endsWith("+json")) {
    return { success: false, status: 415, message: "Content-Type must be application/json." };
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > maxBytes) {
    return { success: false, status: 413, message: "Request body exceeds the allowed size." };
  }

  if (!request.body) {
    return { success: false, status: 400, message: "Request body must be valid JSON." };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { success: false, status: 413, message: "Request body exceeds the allowed size." };
      }

      chunks.push(value);
    }
  } catch {
    return { success: false, status: 400, message: "Request body must be valid JSON." };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { success: true, value: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { success: false, status: 400, message: "Request body must be valid JSON." };
  }
}
