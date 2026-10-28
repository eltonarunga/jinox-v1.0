import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const env = process.env;
const baseRequired = [
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
const missingBase = baseRequired.filter((key) => !env[key]);
const baseEnabled = missingBase.length === 0;

function clientFor(token) {
  return createClient(env.JINOX_TEST_SUPABASE_URL, env.JINOX_TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function visibleRow(token, table, idColumn, id) {
  const { data, error } = await clientFor(token).from(table).select(idColumn).eq(idColumn, id);
  assert.equal(error, null, `Unexpected query error for ${table}: ${error?.message}`);
  return data?.length === 1;
}

const baseTest = baseEnabled ? test : test.skip;

baseTest("owner can read the configured project and dataset", async () => {
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "research_projects", "id", env.JINOX_TEST_PROJECT_ID), true);
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "research_datasets", "id", env.JINOX_TEST_DATASET_ID), true);
});

baseTest("researcher, reviewer and viewer can read project and dataset metadata", async () => {
  for (const role of ["RESEARCHER", "REVIEWER", "VIEWER"]) {
    const token = env[`JINOX_TEST_${role}_TOKEN`];
    assert.equal(await visibleRow(token, "research_projects", "id", env.JINOX_TEST_PROJECT_ID), true, `${role} cannot read project`);
    assert.equal(await visibleRow(token, "research_datasets", "id", env.JINOX_TEST_DATASET_ID), true, `${role} cannot read dataset metadata`);
  }
});

baseTest("unrelated user cannot read project or dataset metadata", async () => {
  assert.equal(await visibleRow(env.JINOX_TEST_UNRELATED_TOKEN, "research_projects", "id", env.JINOX_TEST_PROJECT_ID), false);
  assert.equal(await visibleRow(env.JINOX_TEST_UNRELATED_TOKEN, "research_datasets", "id", env.JINOX_TEST_DATASET_ID), false);
});

const itemVars = ["JINOX_TEST_ASSIGNED_ITEM_ID"];
const itemEnabled = baseEnabled && itemVars.every((key) => Boolean(env[key]));
test("assignment access: assigned researcher, reviewer and manager can inspect the item, viewer cannot", {
  skip: !itemEnabled ? `Set staging-only variables: ${[...missingBase, ...itemVars.filter((key) => !env[key])].join(", ")}` : false,
}, async () => {
  const id = env.JINOX_TEST_ASSIGNED_ITEM_ID;
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "dataset_items", "id", id), true);
  assert.equal(await visibleRow(env.JINOX_TEST_RESEARCHER_TOKEN, "dataset_items", "id", id), true);
  assert.equal(await visibleRow(env.JINOX_TEST_REVIEWER_TOKEN, "dataset_items", "id", id), true);
  assert.equal(await visibleRow(env.JINOX_TEST_VIEWER_TOKEN, "dataset_items", "id", id), false);
  assert.equal(await visibleRow(env.JINOX_TEST_UNRELATED_TOKEN, "dataset_items", "id", id), false);
});

const annotationVars = ["JINOX_TEST_SUBMITTED_ANNOTATION_ID", "JINOX_TEST_DRAFT_ANNOTATION_ID"];
const annotationEnabled = baseEnabled && annotationVars.every((key) => Boolean(env[key]));
test("reviewers can read submitted annotations but not drafts; owners can inspect both", {
  skip: !annotationEnabled ? `Set staging-only variables: ${[...missingBase, ...annotationVars.filter((key) => !env[key])].join(", ")}` : false,
}, async () => {
  const submitted = env.JINOX_TEST_SUBMITTED_ANNOTATION_ID;
  const draft = env.JINOX_TEST_DRAFT_ANNOTATION_ID;
  assert.equal(await visibleRow(env.JINOX_TEST_REVIEWER_TOKEN, "dataset_annotations", "id", submitted), true);
  assert.equal(await visibleRow(env.JINOX_TEST_REVIEWER_TOKEN, "dataset_annotations", "id", draft), false);
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "dataset_annotations", "id", submitted), true);
  assert.equal(await visibleRow(env.JINOX_TEST_OWNER_TOKEN, "dataset_annotations", "id", draft), true);
  assert.equal(await visibleRow(env.JINOX_TEST_VIEWER_TOKEN, "dataset_annotations", "id", submitted), false);
  assert.equal(await visibleRow(env.JINOX_TEST_UNRELATED_TOKEN, "dataset_annotations", "id", submitted), false);
});

test("annotator cannot review their own submitted annotation", {
  skip: !annotationEnabled ? `Set staging-only variables: ${[...missingBase, ...annotationVars.filter((key) => !env[key])].join(", ")}` : false,
}, async () => {
  const researcher = clientFor(env.JINOX_TEST_RESEARCHER_TOKEN);
  const annotationId = env.JINOX_TEST_SUBMITTED_ANNOTATION_ID;
  const { data: annotation, error: readError } = await researcher
    .from("dataset_annotations")
    .select("annotator_id")
    .eq("id", annotationId)
    .single();
  assert.equal(readError, null, "Researcher test user must be able to read their own submitted annotation");
  const { error } = await researcher.from("annotation_reviews").insert({
    annotation_id: annotationId,
    reviewer_id: annotation.annotator_id,
    decision: "accepted",
    review_notes: "Automated negative test; should be rejected by RLS.",
  });
  assert.ok(error, "RLS should reject self-review");
});

if (!baseEnabled) {
  test("base integration prerequisites", { skip: `Set staging-only variables: ${missingBase.join(", ")}` }, () => {});
}
