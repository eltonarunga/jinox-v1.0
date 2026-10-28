/** Parse untrusted request JSON without leaking parser details into route handlers. */
export type JsonBodyResult =
  | { success: true; value: unknown }
  | { success: false };

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  try {
    return { success: true, value: await request.json() };
  } catch {
    return { success: false };
  }
}
