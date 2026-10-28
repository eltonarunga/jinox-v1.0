import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const env = process.env;
const required = [
  "JINOX_TEST_SUPABASE_URL",
  "JINOX_TEST_SUPABASE_ANON_KEY",
  "JINOX_TEST_PROJECT_ID",
  "JINOX_TEST_DATASET_ID",
  "JINOX_TEST_OWNER_TOKEN",
  "JINOX_TEST_RESEARCHER_TOKEN",
  "JINOX_TEST_REVIEWER_TOKEN",
  "JINOX_TEST_VIEWER_TOKEN",
  "JINOX_TEST_UNRELATED_TOKEN",
];
const missing = required.filter((key) => !env[key]);
const enabled = missing.length === 0;
const integrationTest = enabled ? test : test.skip;

function clientFor(token) {
  const client = createClient(env.JINOX_TEST_SUPABASE_URL, env.JINOX_TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  return client;
}

async function visibleRow(token, table, idColumn, id) {
  const { data, error } = await clientFor(token).from(table).select(idColumn).eq(idColumn, id);
  assert.equal(error, null, `Unexpected query error for ${table}: ${error?.message}`);
  return data?.length === 1;
}

integrationTest("owner can read the configured project and dataset", async () => {
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "research_projects", "id", env.JINOX_TEST_PROJECT_ID), true);
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "research_datasets", "id", env.JINOX_TEST_DATASET_ID), true);
});

integrationTest("project collaborators can read project and dataset metadata", async () => {
  for (const role of ["RESEARCHER", "REVIEWER", "VIEWER"]) {
    const token = env[`JINOX_TEST_${role}_TOKEN`];
    assert.equal(await visibleRow(token, "research_projects", "id", env.JINOX_TEST_PROJECT_ID), true, `${role} cannot read project`);
    assert.equal(await visibleRow(token, "research_datasets", "id", env.JINOX_TEST_DATASET_ID), true, `${role} cannot read dataset metadata`);
  }
});

integrationTest("unrelated user cannot read project or dataset metadata", async () => {
  assert.equal(await visibleRow(env.JINOX_TEST_UNRELATED_TOKEN, "research_projects", "id", env.JINOX_TEST_PROJECT_ID), false);
  assert.equal(await visibleRow(env.JINOX_TEST_UNRELATED_TOKEN, "research_datasets", "id", env.JINOX_TEST_DATASET_ID), false);
});

if (!enabled) {
  test("integration prerequisites", { skip: `Set staging-only variables: ${missing.join(", ")}` }, () => {});
}
