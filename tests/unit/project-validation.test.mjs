import test from "node:test";
import assert from "node:assert/strict";
import { parseCreateResearchProjectInput } from "../../lib/domains/projects/validation.ts";

test("accepts valid project input and defaults research area", () => {
  const result = parseCreateResearchProjectInput({ name: "  Kenya Oral Health  ", description: "  Pilot research  " });
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.data, {
    name: "Kenya Oral Health",
    description: "Pilot research",
    researchArea: "oral_health",
  });
});

test("rejects null, arrays, and primitive payloads", () => {
  for (const value of [null, [], "project", 42]) {
    assert.equal(parseCreateResearchProjectInput(value).success, false);
  }
});

test("rejects missing, short, and overlong project names", () => {
  for (const name of [undefined, "", "ab", "x".repeat(161)]) {
    assert.equal(parseCreateResearchProjectInput({ name }).success, false);
  }
});

test("rejects overlong descriptions and unsupported research areas", () => {
  assert.equal(
    parseCreateResearchProjectInput({ name: "Valid name", description: "x".repeat(5001) }).success,
    false,
  );
  const result = parseCreateResearchProjectInput({ name: "Valid name", research_area: "unapproved_area" });
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error, /Unsupported research_area/);
});

test("accepts every declared research area", () => {
  const areas = ["oral_health", "environmental_health", "genomics", "imaging", "digital_twin", "multimodal", "other"];
  for (const research_area of areas) {
    const result = parseCreateResearchProjectInput({ name: "Valid name", research_area });
    assert.equal(result.success, true, `Expected ${research_area} to be accepted`);
  }
});

test("trims user-entered metadata", () => {
  const result = parseCreateResearchProjectInput({ name: "  Project X ", description: "  Description  " });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Project X");
    assert.equal(result.data.description, "Description");
  }
});
