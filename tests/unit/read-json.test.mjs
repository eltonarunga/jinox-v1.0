import test from "node:test";
import assert from "node:assert/strict";
import { readJsonBody } from "../../lib/api/read-json.ts";

test("returns parsed JSON when the request body is valid", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Project A" }),
  }));
  assert.deepEqual(result, { success: true, value: { name: "Project A" } });
});

test("returns a safe failure result for malformed JSON", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad json",
  }));
  assert.deepEqual(result, {
    success: false,
    status: 400,
    message: "Request body must be valid JSON.",
  });
});

test("rejects non-JSON content types", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  }));
  assert.deepEqual(result, {
    success: false,
    status: 415,
    message: "Content-Type must be application/json.",
  });
});

test("rejects a body that exceeds the byte limit while streaming", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "too large" }),
  }), 5);
  assert.deepEqual(result, {
    success: false,
    status: 413,
    message: "Request body exceeds the allowed size.",
  });
});

test("rejects an oversized declared Content-Length before reading the body", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": "100" },
    body: "{}",
  }), 5);
  assert.deepEqual(result, {
    success: false,
    status: 413,
    message: "Request body exceeds the allowed size.",
  });
});
