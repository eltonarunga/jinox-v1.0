import test from "node:test";
import assert from "node:assert/strict";
import { parseRegisterDatasetInput } from "../../lib/domains/datasets/validation.ts";

const validInput = {
  project_id: "project-123",
  name: "Kenya panoramic radiographs",
  description: "Pseudonymized research images collected under an approved protocol.",
  modality: "panoramic_xray",
  source_type: "research_collection",
  consent_basis: "pending_review",
  license: null,
  record_count: 0,
};

test("accepts valid dataset metadata and applies documented defaults", () => {
  const result = parseRegisterDatasetInput({
    project_id: "project-123",
    name: "Dental image set",
    modality: "cbct",
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.sourceType, "research_collection");
  assert.equal(result.data.consentBasis, "pending_review");
  assert.equal(result.data.recordCount, null);
  assert.equal(result.data.name, "Dental image set");
});

test("rejects non-object payloads", () => {
  assert.equal(parseRegisterDatasetInput(null).success, false);
  assert.equal(parseRegisterDatasetInput([]).success, false);
  assert.equal(parseRegisterDatasetInput("dataset").success, false);
});

test("rejects unsupported modalities and consent bases", () => {
  assert.match(
    parseRegisterDatasetInput({ ...validInput, modality: "patient_record_dump" }).success
      ? ""
      : parseRegisterDatasetInput({ ...validInput, modality: "patient_record_dump" }).error,
    /Unsupported modality/
  );
  const result = parseRegisterDatasetInput({ ...validInput, consent_basis: "unknown" });
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error, /Unsupported consent_basis/);
});

test("rejects missing project and invalid names", () => {
  const missingProject = parseRegisterDatasetInput({ ...validInput, project_id: " " });
  assert.equal(missingProject.success, false);
  const shortName = parseRegisterDatasetInput({ ...validInput, name: "x" });
  assert.equal(shortName.success, false);
  const longName = parseRegisterDatasetInput({ ...validInput, name: "x".repeat(161) });
  assert.equal(longName.success, false);
});

test("rejects negative, fractional and unsafe record counts", () => {
  for (const record_count of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1, "12"]) {
    const result = parseRegisterDatasetInput({ ...validInput, record_count });
    assert.equal(result.success, false, `Expected rejection for record_count=${record_count}`);
  }
});

test("normalizes whitespace and rejects overlong fields", () => {
  const normalized = parseRegisterDatasetInput({ ...validInput, name: "  Dataset A  ", license: "  " });
  assert.equal(normalized.success, true);
  if (normalized.success) {
    assert.equal(normalized.data.name, "Dataset A");
    assert.equal(normalized.data.license, null);
  }

  const result = parseRegisterDatasetInput({ ...validInput, license: "L".repeat(301) });
  assert.equal(result.success, false);
});
