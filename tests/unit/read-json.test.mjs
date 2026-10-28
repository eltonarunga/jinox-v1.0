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
  assert.deepEqual(result, { success: false });
});
