import test from "node:test";
import assert from "node:assert/strict";
import { getSafeRedirectPath } from "../../lib/auth/safe-redirect.ts";

const base = "https://jinox.example/login";

test("allows a same-origin path with query and fragment", () => {
  assert.equal(getSafeRedirectPath("/research/projects?tab=mine#recent", base), "/research/projects?tab=mine#recent");
});

test("rejects protocol-relative and absolute external destinations", () => {
  assert.equal(getSafeRedirectPath("//evil.example/path", base), "/");
  assert.equal(getSafeRedirectPath("https://evil.example/path", base), "/");
});

test("rejects backslash-based external destinations", () => {
  assert.equal(getSafeRedirectPath("/\\\\evil.example/path", base), "/");
});

test("rejects missing, relative and malformed base URLs", () => {
  assert.equal(getSafeRedirectPath(null, base), "/");
  assert.equal(getSafeRedirectPath("research/projects", base), "/");
  assert.equal(getSafeRedirectPath("/research/projects", "not-a-url"), "/");
});
