import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const env = process.env;
const required = [
  "JINOX_TEST_SUPABASE_URL",
  "JINOX_TEST_SUPABASE_ANON_KEY",
  "JINOX_TEST_OWNER_TOKEN",
  "JINOX_TEST_RESEARCHER_TOKEN",
  "JINOX_TEST_REVIEWER_TOKEN",
  "JINOX_TEST_ANNOTATION_STALE_SUBMITTED_ID",
  "JINOX_TEST_ANNOTATION_WRONG_ASSIGNEE_ID",
  "JINOX_TEST_ANNOTATION_ACCEPT_ID",
  "JINOX_TEST_ANNOTATION_CHANGES_REQUESTED_ID",
  "JINOX_TEST_ANNOTATION_ACTIVE_REASSIGN_ITEM_ID",
  "JINOX_TEST_ANNOTATION_QUEUED_ASSIGN_ITEM_ID",
  "JINOX_TEST_ANNOTATION_NEW_ASSIGNEE_ID",
  "JINOX_TEST_RELEASE_DATASET_ID",
  "JINOX_TEST_RELEASE_STALE_ITEM_ID",
  "JINOX_TEST_RELEASE_ELIGIBLE_ITEM_ID",
];
const missing = required.filter((key) => !env[key]);
const enabled = missing.length === 0;

function client(token) {
  return createClient(env.JINOX_TEST_SUPABASE_URL, env.JINOX_TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

const owner = () => client(env.JINOX_TEST_OWNER_TOKEN);
const researcher = () => client(env.JINOX_TEST_RESEARCHER_TOKEN);
const reviewer = () => client(env.JINOX_TEST_REVIEWER_TOKEN);
const workflowTest = enabled ? test : test.skip;

workflowTest("review RPC rejects a submitted annotation when a newer revision exists", async () => {
  const { error } = await reviewer().rpc("review_dataset_annotation", {
    p_annotation_id: env.JINOX_TEST_ANNOTATION_STALE_SUBMITTED_ID,
    p_decision: "accepted",
    p_review_notes: "Synthetic regression test: stale revision must not be accepted.",
  });
  assert.ok(error, "A stale submitted revision must be rejected");
  assert.match(error.message, /current annotation revision/i);
});

workflowTest("review RPC rejects an annotation owned by someone other than the current assignee", async () => {
  const { error } = await reviewer().rpc("review_dataset_annotation", {
    p_annotation_id: env.JINOX_TEST_ANNOTATION_WRONG_ASSIGNEE_ID,
    p_decision: "accepted",
    p_review_notes: "Synthetic regression test: non-current assignee must not be reviewed.",
  });
  assert.ok(error, "An annotation from a former/non-current assignee must be rejected");
  assert.match(error.message, /current assigned researcher/i);
});

workflowTest("current submitted revision can be independently accepted and advances the item", async () => {
  const db = reviewer();
  const annotationId = env.JINOX_TEST_ANNOTATION_ACCEPT_ID;
  const { data: before, error: beforeError } = await owner()
    .from("dataset_annotations").select("dataset_item_id,annotator_id,status")
    .eq("id", annotationId).single();
  assert.equal(beforeError, null);
  assert.equal(before.status, "submitted");

  const { data, error } = await db.rpc("review_dataset_annotation", {
    p_annotation_id: annotationId,
    p_decision: "accepted",
    p_review_notes: "Synthetic positive control: current revision accepted.",
  });
  assert.equal(error, null, `Current revision review failed: ${error?.message}`);
  assert.equal(data.annotation_id, annotationId);
  assert.equal(data.decision, "accepted");
  assert.equal(data.item_status, "accepted");

  const { data: item, error: itemError } = await owner()
    .from("dataset_items").select("status,assigned_to")
    .eq("id", before.dataset_item_id).single();
  assert.equal(itemError, null);
  assert.equal(item.status, "accepted");
  assert.equal(item.assigned_to, before.annotator_id);

  const { data: reviews, error: reviewError } = await owner()
    .from("annotation_reviews").select("decision")
    .eq("annotation_id", annotationId);
  assert.equal(reviewError, null);
  assert.ok(reviews.some((row) => row.decision === "accepted"));
});

workflowTest("changes requested permits a new draft revision and makes the prior revision stale", async () => {
  const annotationId = env.JINOX_TEST_ANNOTATION_CHANGES_REQUESTED_ID;
  const { data: before, error: beforeError } = await researcher()
    .from("dataset_annotations").select("id,dataset_item_id,annotator_id,revision,status")
    .eq("id", annotationId).single();
  assert.equal(beforeError, null);
  assert.equal(before.status, "submitted");

  const { data: review, error: reviewError } = await reviewer().rpc("review_dataset_annotation", {
    p_annotation_id: annotationId,
    p_decision: "changes_requested",
    p_review_notes: "Synthetic regression test: revise and resubmit.",
  });
  assert.equal(reviewError, null, `Changes-requested review failed: ${reviewError?.message}`);
  assert.equal(review.item_status, "in_progress");

  const { data: saved, error: saveError } = await researcher().rpc("save_dataset_annotation", {
    p_dataset_item_id: before.dataset_item_id,
    p_labels: { validation_fixture: true, revision_state: "draft" },
    p_notes: "Synthetic revision created after changes requested.",
    p_submit: false,
  });
  assert.equal(saveError, null, `New draft revision could not be saved: ${saveError?.message}`);
  assert.ok(saved.revision > before.revision);
  assert.equal(saved.status, "draft");

  const { error: staleReviewError } = await reviewer().rpc("review_dataset_annotation", {
    p_annotation_id: annotationId,
    p_decision: "accepted",
    p_review_notes: "Synthetic regression test: old revision is now stale.",
  });
  assert.ok(staleReviewError, "The prior submitted revision must become unreviewable");
  assert.match(staleReviewError.message, /current annotation revision/i);
});

workflowTest("active item reassignment is blocked by the database trigger", async () => {
  const itemId = env.JINOX_TEST_ANNOTATION_ACTIVE_REASSIGN_ITEM_ID;
  const db = owner();
  const { data: before, error: readError } = await db.from("dataset_items")
    .select("assigned_to,status").eq("id", itemId).single();
  assert.equal(readError, null);
  assert.notEqual(before.status, "queued");
  assert.notEqual(before.assigned_to, env.JINOX_TEST_ANNOTATION_NEW_ASSIGNEE_ID);

  const { error } = await db.from("dataset_items")
    .update({ assigned_to: env.JINOX_TEST_ANNOTATION_NEW_ASSIGNEE_ID })
    .eq("id", itemId);
  assert.ok(error, "Reassignment after work starts must fail");
  assert.match(error.message, /cannot be reassigned after work begins/i);

  const { data: after, error: afterError } = await db.from("dataset_items")
    .select("assigned_to,status").eq("id", itemId).single();
  assert.equal(afterError, null);
  assert.equal(after.assigned_to, before.assigned_to);
  assert.equal(after.status, before.status);
});

workflowTest("queued item can be assigned to a project researcher", async () => {
  const itemId = env.JINOX_TEST_ANNOTATION_QUEUED_ASSIGN_ITEM_ID;
  const db = owner();
  const { data: before, error: readError } = await db.from("dataset_items")
    .select("assigned_to,status").eq("id", itemId).single();
  assert.equal(readError, null);
  assert.equal(before.status, "queued");

  const { error } = await db.from("dataset_items")
    .update({ assigned_to: env.JINOX_TEST_ANNOTATION_NEW_ASSIGNEE_ID })
    .eq("id", itemId);
  assert.equal(error, null, `Queued assignment should be allowed: ${error?.message}`);

  const { data: after, error: afterError } = await db.from("dataset_items")
    .select("assigned_to,status").eq("id", itemId).single();
  assert.equal(afterError, null);
  assert.equal(after.assigned_to, env.JINOX_TEST_ANNOTATION_NEW_ASSIGNEE_ID);
  assert.equal(after.status, "queued");
});

workflowTest("release manifest excludes an item whose latest revision is a draft", async () => {
  const { data: release, error } = await owner().rpc("create_dataset_release", {
    p_dataset_id: env.JINOX_TEST_RELEASE_DATASET_ID,
  });
  assert.equal(error, null, `Synthetic release fixture failed: ${error?.message}`);
  assert.ok(release.record_count > 0);

  const { data: row, error: readError } = await owner().from("dataset_releases")
    .select("record_count,manifest,manifest_sha256").eq("id", release.id).single();
  assert.equal(readError, null);
  const itemIds = row.manifest.records.map((record) => record.dataset_item_id);
  assert.equal(row.record_count, itemIds.length);
  assert.ok(itemIds.includes(env.JINOX_TEST_RELEASE_ELIGIBLE_ITEM_ID),
    "Positive-control item should be present in the release");
  assert.ok(!itemIds.includes(env.JINOX_TEST_RELEASE_STALE_ITEM_ID),
    "Item with a newer draft revision must be excluded");
  assert.equal(new Set(itemIds).size, itemIds.length, "Manifest must not contain duplicate dataset items");
  assert.equal(row.manifest_sha256, release.manifest_sha256);
});

if (env.JINOX_REQUIRE_ANNOTATION_WORKFLOW_TESTS === "1" && missing.length) {
  throw new Error(`Strict annotation workflow validation requires synthetic staging fixtures. Missing: ${missing.join(", ")}`);
}
