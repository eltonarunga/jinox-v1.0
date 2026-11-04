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


const assetEnabled = itemEnabled && Boolean(env.JINOX_TEST_ASSIGNED_ASSET_ID);
test("assigned researcher, reviewer and owner can read an approved dataset asset and its private object", {
  skip: !assetEnabled ? "Set staging-only JINOX_TEST_ASSIGNED_ASSET_ID and the base authorization fixtures." : false,
}, async () => {
  const assetId = env.JINOX_TEST_ASSIGNED_ASSET_ID;
  for (const token of [env.JINOX_TEST_OWNER_TOKEN, env.JINOX_TEST_RESEARCHER_TOKEN, env.JINOX_TEST_REVIEWER_TOKEN]) {
    const client = clientFor(token);
    const { data: asset, error } = await client.from("clinical_assets")
      .select("id,status,storage_path").eq("id", assetId).single();
    assert.equal(error, null, `Authorized project collaborator cannot read asset metadata: ${error?.message}`);
    assert.equal(asset.status, "approved", "Only approved assets should be exposed to project collaborators");
    const { data: signed, error: storageError } = await client.storage
      .from("jinox-clinical-assets").createSignedUrl(asset.storage_path, 60);
    assert.equal(storageError, null, `Authorized project collaborator cannot read the private object: ${storageError?.message}`);
    assert.ok(signed?.signedUrl);
  }
  for (const token of [env.JINOX_TEST_VIEWER_TOKEN, env.JINOX_TEST_UNRELATED_TOKEN]) {
    const { data, error } = await clientFor(token).from("clinical_assets")
      .select("id").eq("id", assetId);
    assert.equal(error, null);
    assert.equal(data?.length ?? 0, 0, "Viewer or unrelated user must not read assigned asset metadata");
  }
});


const pendingAssetEnabled = baseEnabled && Boolean(env.JINOX_TEST_PENDING_ASSET_ID);
test("asset owners cannot self-approve or rewrite uploaded asset metadata", {
  skip: !pendingAssetEnabled ? `Set staging-only variables: ${[...missingBase, ...(!env.JINOX_TEST_PENDING_ASSET_ID ? ["JINOX_TEST_PENDING_ASSET_ID"] : [])].join(", ")}` : false,
}, async () => {
  const owner = clientFor(env.JINOX_TEST_OWNER_TOKEN);
  const { data: asset, error: readError } = await owner.from("clinical_assets")
    .select("id,case_id,owner_id,status,modality,content_type,byte_size")
    .eq("id", env.JINOX_TEST_PENDING_ASSET_ID).single();
  assert.equal(readError, null, `Owner fixture asset must be readable: ${readError?.message}`);
  assert.equal(asset.status, "pending_review");

  const { error: approvalError } = await owner.from("clinical_assets")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", asset.id);
  assert.ok(approvalError, "Authenticated asset owner must not be able to approve an upload");

  const { data: afterUpdate, error: verifyError } = await owner.from("clinical_assets")
    .select("status").eq("id", asset.id).single();
  assert.equal(verifyError, null);
  assert.equal(afterUpdate.status, "pending_review");

  const { data: authData, error: authError } = await owner.auth.getUser();
  assert.equal(authError, null);
  assert.ok(authData.user?.id);

  const fakeName = `${asset.modality}-2026-11-04-abcdef12.jpg`;
  const { error: insertError } = await owner.from("clinical_assets").insert({
    case_id: asset.case_id,
    owner_id: authData.user.id,
    modality: asset.modality,
    original_filename: fakeName,
    content_type: asset.content_type,
    byte_size: asset.byte_size,
    storage_path: `${authData.user.id}/${asset.case_id}/00000000-0000-4000-8000-000000000000-${fakeName}`,
    status: "approved",
    metadata: { filename_redacted: true, client_extension: ".jpg" },
  });
  assert.ok(insertError, "Authenticated uploader must not create an already-approved asset");
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
  const { error: rpcError } = await researcher.rpc("review_dataset_annotation", {
    p_annotation_id: annotationId,
    p_decision: "accepted",
    p_review_notes: "Automated negative test; should be rejected by the RPC.",
  });
  assert.ok(rpcError, "The review RPC must reject an annotator reviewing their own submission");
});

if (!baseEnabled) {
  test("base integration prerequisites", { skip: `Set staging-only variables: ${missingBase.join(", ")}` }, () => {});
}


const reviewVars = [
  "JINOX_TEST_ASSET_REVIEW_ADMIN_TOKEN",
  "JINOX_TEST_ASSET_REVIEW_NON_ADMIN_TOKEN",
  "JINOX_TEST_ASSET_REVIEW_OWNER_TOKEN",
  "JINOX_TEST_ASSET_REVIEW_APPROVE_ID",
  "JINOX_TEST_ASSET_REVIEW_REJECT_ID",
  "JINOX_TEST_ASSET_REVIEW_QUARANTINE_ID",
  "JINOX_TEST_ASSET_REVIEW_CONCURRENT_ID",
];
const missingReview = reviewVars.filter((key) => !env[key]);
const reviewEnabled = missingReview.length === 0;

test("only a non-owner global admin can make audited asset review decisions", {
  skip: !reviewEnabled ? \`Set staging-only variables: \${missingReview.join(", ")}\` : false,
}, async () => {
  const admin = clientFor(env.JINOX_TEST_ASSET_REVIEW_ADMIN_TOKEN);
  const nonAdmin = clientFor(env.JINOX_TEST_ASSET_REVIEW_NON_ADMIN_TOKEN);
  const owner = clientFor(env.JINOX_TEST_ASSET_REVIEW_OWNER_TOKEN);

  const { data: adminUser, error: adminAuthError } = await admin.auth.getUser();
  assert.equal(adminAuthError, null);
  assert.ok(adminUser.user?.id);

  const { error: ownerAttempt } = await owner.rpc("review_clinical_asset", {
    p_asset_id: env.JINOX_TEST_ASSET_REVIEW_APPROVE_ID,
    p_decision: "approve",
    p_reason: "Owner self-review must fail.",
  });
  assert.ok(ownerAttempt, "Uploader must not approve an asset");

  const { error: nonAdminAttempt } = await nonAdmin.rpc("review_clinical_asset", {
    p_asset_id: env.JINOX_TEST_ASSET_REVIEW_APPROVE_ID,
    p_decision: "approve",
    p_reason: "Non-admin review must fail.",
  });
  assert.ok(nonAdminAttempt, "Non-admin users must not review assets");

  const { error: ownerUpdate } = await owner.from("clinical_assets")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", env.JINOX_TEST_ASSET_REVIEW_APPROVE_ID);
  assert.ok(ownerUpdate, "Uploader must not directly update asset review state");

  for (const [decision, fixture] of [
    ["approve", env.JINOX_TEST_ASSET_REVIEW_APPROVE_ID],
    ["reject", env.JINOX_TEST_ASSET_REVIEW_REJECT_ID],
    ["quarantine", env.JINOX_TEST_ASSET_REVIEW_QUARANTINE_ID],
  ]) {
    const reason = decision === "approve" ? "Staging approval fixture." : \`Staging \${decision} fixture rationale.\`;
    const { data, error } = await admin.rpc("review_clinical_asset", {
      p_asset_id: fixture,
      p_decision: decision,
      p_reason: reason,
    });
    assert.equal(error, null, \`Admin \${decision} failed: \${error?.message}\`);
    assert.equal(data.decision, decision);

    const expectedStatus = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "quarantined";
    const { data: asset, error: assetError } = await admin.from("clinical_assets")
      .select("status,reviewed_at,validation_notes").eq("id", fixture).single();
    assert.equal(assetError, null);
    assert.equal(asset.status, expectedStatus);
    assert.ok(asset.reviewed_at);
    assert.equal(asset.validation_notes, reason);

    const { data: audit, error: auditError } = await admin.from("clinical_asset_reviews")
      .select("asset_id,reviewer_id,decision,reason,previous_status,new_status")
      .eq("asset_id", fixture).single();
    assert.equal(auditError, null);
    assert.equal(audit.reviewer_id, adminUser.user.id);
    assert.equal(audit.previous_status, "pending_review");
    assert.equal(audit.new_status, expectedStatus);
    assert.equal(audit.reason, reason);
  }

  const { data: ownerAudit, error: ownerAuditError } = await owner.from("clinical_asset_reviews")
    .select("id").eq("asset_id", env.JINOX_TEST_ASSET_REVIEW_APPROVE_ID);
  assert.equal(ownerAuditError, null);
  assert.equal(ownerAudit?.length ?? 0, 0, "Non-admin uploader must not read global asset review history");
});

test("concurrent review attempts produce exactly one decision and one audit row", {
  skip: !reviewEnabled ? \`Set staging-only variables: \${missingReview.join(", ")}\` : false,
}, async () => {
  const admin = clientFor(env.JINOX_TEST_ASSET_REVIEW_ADMIN_TOKEN);
  const assetId = env.JINOX_TEST_ASSET_REVIEW_CONCURRENT_ID;
  const results = await Promise.all([
    admin.rpc("review_clinical_asset", {
      p_asset_id: assetId,
      p_decision: "approve",
      p_reason: "Concurrent staging test A.",
    }),
    admin.rpc("review_clinical_asset", {
      p_asset_id: assetId,
      p_decision: "quarantine",
      p_reason: "Concurrent staging test B.",
    }),
  ]);
  assert.equal(results.filter((result) => !result.error).length, 1);
  assert.equal(results.filter((result) => result.error).length, 1);

  const { data: audit, error } = await admin.from("clinical_asset_reviews")
    .select("id,decision,new_status").eq("asset_id", assetId);
  assert.equal(error, null);
  assert.equal(audit?.length, 1, "Only one final review record should exist for the asset");
  const { data: asset, error: assetError } = await admin.from("clinical_assets")
    .select("status").eq("id", assetId).single();
  assert.equal(assetError, null);
  assert.equal(asset.status, audit[0].new_status);
});
