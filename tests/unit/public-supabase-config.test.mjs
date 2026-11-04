import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getPublicSupabaseConfig } from "../../lib/supabase/public-config.ts";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

afterEach(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;

  if (originalAnonKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
});

test("returns null when either public setting is missing", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  assert.equal(getPublicSupabaseConfig(), null);

  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
  assert.equal(getPublicSupabaseConfig(), null);
});

test("accepts a valid HTTPS Supabase URL and anon key", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

  assert.deepEqual(getPublicSupabaseConfig(), {
    url: "https://project.supabase.co",
    anonKey: "public-anon-key",
  });
});

test("accepts HTTP only for local development hosts", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
  assert.equal(getPublicSupabaseConfig()?.url, "http://localhost:54321");

  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
  assert.equal(getPublicSupabaseConfig()?.url, "http://127.0.0.1:54321");
});

test("rejects insecure remote URLs and unsupported protocols", () => {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://project.supabase.co";
  assert.equal(getPublicSupabaseConfig(), null);

  process.env.NEXT_PUBLIC_SUPABASE_URL = "ftp://localhost:54321";
  assert.equal(getPublicSupabaseConfig(), null);
});

test("rejects URLs containing embedded credentials", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://user:password@project.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
  assert.equal(getPublicSupabaseConfig(), null);
});

test("rejects malformed URLs", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
  assert.equal(getPublicSupabaseConfig(), null);
});
