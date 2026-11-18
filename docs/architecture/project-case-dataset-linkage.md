# Project, case, asset, and dataset relationship design

**Status:** Proposed architecture; not implemented  
**Scope:** Design only. This document does not authorize or perform database, Supabase, storage, or production changes.

## 1. Why this design is needed

The repository currently has two related but separate data models:

- Research work is organized under `research_projects`. A `research_dataset` belongs to a project through `project_id`, and dataset items reference `clinical_assets`.
- Clinical intake is organized around `clinical_cases`, `clinical_assets`, and `clinical_observations`. A case has an `owner_id`, but no `project_id`.

The result is a broken user journey: a user can create a project and register dataset metadata, then separately create an owner-scoped case and upload assets. The database does not express which project governs that case. Dataset-item policies also need a database-enforced guarantee that the selected asset belongs to the same project as the dataset, rather than relying on a UI filter.

This is a data-model and authorization problem, not something a navigation redesign can solve.

## 2. Current model observed in the repository

| Resource | Current relationship | Important limitation |
| --- | --- | --- |
| `research_projects` | Owned by `owner_id` | Project membership helpers and roles already exist |
| `research_datasets` | Required `project_id` | Dataset metadata is project-scoped |
| `clinical_cases` | Required `owner_id`; unique case code per owner | No project association |
| `clinical_assets` | Required `case_id` and `owner_id` | Authorization is primarily owner/case based |
| `clinical_observations` | Required `case_id` and `owner_id` | No direct project relationship |
| `dataset_items` | References both `dataset_id` and `clinical_asset_id` | The relationship needs an explicit same-project invariant |

The existing project-role helpers include membership and management checks. The design should reuse and consistently apply those helpers rather than introduce a second, conflicting role system.

## 3. Target relationship

The recommended ownership path is:

`research_project → clinical_case → clinical_asset → dataset_item → research_dataset`

More precisely, a dataset belongs to one project. A case belongs to one project. Assets inherit their project scope through their case. A dataset item may link an approved asset only when the asset's case and the target dataset belong to the same project.

A simplified relationship view:

```text
research_project
  ├── research_project_members
  ├── research_datasets
  │     └── dataset_items ───────────────┐
  │                                      │
  └── clinical_cases                     │
        ├── clinical_observations        │
        └── clinical_assets ─────────────┘
```

Avoid adding a second independent `project_id` to every child table unless there is a clear query or integrity requirement. Duplicated scope columns create opportunities for disagreement. If a denormalized project key is later needed for composite foreign keys or query performance, constrain it against the parent relationship.

## 4. Identity and authorization principles

Keep these concepts distinct:

- **Project scope:** which project governs permitted use and collaboration.
- **Creator/uploader:** which authenticated user created a case or uploaded an asset. Preserve this attribution.
- **Project role:** what the user may do within that project.
- **Review status:** whether an asset has passed the existing review process. Project membership must not imply approval.

For new project-scoped records, the project is the authorization boundary. The uploader's identity remains useful provenance, but `owner_id` must not accidentally prevent authorized project members from carrying out their assigned work.

Do not replace owner-only policies with broad `TO authenticated` policies. Each read/write policy must call the existing project membership/role helpers and enforce the required role for that operation. Updates need both `USING` and `WITH CHECK` conditions so a user cannot move a row into a project they do not control.

A starting role matrix for review (not a final policy specification):

| Action | Suggested minimum project role |
| --- | --- |
| View project cases and approved/pending asset metadata | Active project member, subject to project data restrictions |
| Create a case | Project owner, principal investigator, or project manager |
| Upload/register assets | Project manager or designated data curator |
| Review or approve an asset | Authorized reviewer / data steward; never implied by upload permission |
| Add an approved asset to a dataset | Project manager or data curator |
| Annotate assigned dataset items | Assigned annotator under the existing assignment rules |
| Change project membership | Existing project manager/owner authority |

Finalize role names against the current role enum and helper functions before writing policies.

## 5. Migration and legacy-record strategy

Use a staged, non-destructive migration. Do not guess which project an existing case belongs to.

1. Add a nullable `project_id` foreign key to `clinical_cases` and an index. Keep the initial column nullable so existing records remain valid.
2. Keep null-project legacy cases under their current owner-only access rules. Do not expose them to project members by inference.
3. Add an explicit, audited workflow for a case owner or authorized administrator to associate a legacy case with a project. Verify that the actor can manage the target project.
4. Require `project_id` for all newly created cases once the project-aware intake UI and policies are deployed.
5. After inventorying and resolving all legacy cases, consider making `project_id` non-null in a separate migration. This is a later decision, not part of the initial rollout.

A case must not be silently copied or reassigned to another project. If cross-project transfer is ever supported, define a privileged, audited transaction that rechecks consent, permitted purpose, asset status, dataset links, and retention obligations. Default to disallowing transfer once assets have entered a dataset or annotation workflow.

## 6. Database integrity requirements

Before implementation, specify and test the following invariants:

- A case's project exists and is active for new intake.
- An asset inherits its project scope from its case; clients cannot submit a different project identifier for the asset.
- A dataset item links an asset only if the asset's case project equals the dataset project.
- Only assets in the approved state can be added to a dataset. Approval remains controlled by the existing review workflow.
- A dataset item cannot be used to bypass the asset's project membership or review restrictions.
- Deleting a project or case must not cascade-delete governed source data without an explicit retention and audit decision. Review existing cascade behavior before changing it.
- All critical association, approval, and removal events are attributable and written atomically with the relevant change.

Enforce cross-table invariants in the database (for example, with constrained composite relationships or a carefully designed trigger/RPC), not only in React filters. Choose the simplest design that can be proven with SQL tests. Any privileged function must have a narrowly defined execution grant, explicit actor checks, a fixed search path, and a documented reason it needs elevated privileges.

## 7. Storage authorization

Storage policies must derive access from the case's project relationship and the actor's current project role, while preserving a separate owner-only path for legacy null-project cases.

- Keep the bucket private.
- Verify the object path is bound to the matching asset/case record; do not trust a client-supplied path or project ID.
- Ensure project membership revocation takes effect for future storage requests.
- Use short-lived signed URLs and avoid treating an issued URL as a substitute for ongoing authorization.
- Preserve existing object paths during the initial migration unless a separately tested path migration is justified.
- Test upload, read, update, and delete behavior for every relevant role, including a user removed from a project.

## 8. UI workflow after the data model is verified

The intended user journey becomes:

1. Select or create a project.
2. Create a case inside that project.
3. Upload files to the case; show upload and registration status separately.
4. Submit assets for the existing review process.
5. Add only approved assets to a dataset in the same project.
6. Assign annotation work from that dataset.
7. Route submitted annotations to independent QA.

The intake page should show the active project explicitly and filter cases by that project. The dataset workspace should show only assets from the selected project's cases. Empty states should explain the prerequisite action without implying that metadata registration uploads files or that upload means approval.

This UI work must follow, not precede, the database authorization and integrity design.

## 9. Required test matrix before rollout

Use a dedicated staging project with synthetic users and synthetic assets only. Tests must actually execute; a skipped integration suite is not evidence.

| Scenario | Expected result |
| --- | --- |
| Project member reads a case in their project | Allowed only for a role permitted to view that data |
| Non-member reads the same case | Denied |
| Member creates a case in a project they cannot manage | Denied |
| Curator uploads/registers an asset to an authorized case | Allowed |
| User forges a different project ID for an asset | Rejected; project is derived from the case |
| Dataset A attempts to include an asset from Project B | Rejected by the database |
| Dataset attempts to include a pending/rejected asset | Rejected |
| Annotator accesses an unassigned task | Denied by existing assignment controls |
| Reviewer attempts self-review | Denied by existing independent-review controls |
| Member is removed from a project | Subsequent case, asset, and storage reads are denied |
| Legacy null-project case is accessed by a project member | Denied unless it is explicitly associated through the audited workflow |
| Transaction fails during case/asset association | No partial association or audit event remains |

Also test update-policy behavior, storage signed-URL expiry, concurrent association attempts, and rollback of audit writes.

## 10. Delivery sequence and gates

1. **Design review:** confirm role matrix, legacy handling, consent/purpose rules, retention behavior, and relationship invariants.
2. **Migration and database tests:** add nullable project association, integrity enforcement, RLS, storage policies, and rollback tests in an isolated local/staging environment.
3. **Staging authorization:** provision only a dedicated staging project and synthetic fixtures after explicit authorization. Record the applied migration inventory and actual test results.
4. **API and UI integration:** update case creation, case listing, asset intake, dataset curation, and annotation navigation to carry the selected project context.
5. **Production readiness:** complete privacy/ethics review, backup/restore checks, migration review, and a controlled release plan before any production database change.

## 11. Explicit non-goals

This design does not implement or authorize:

- Any SQL migration or schema change.
- Any staging or production Supabase provisioning or configuration.
- Any production data backfill, reassignment, or deletion.
- Any change to real patient-data intake permissions.
- Any new clinical inference, AI diagnosis, or model-training capability.

**Decision requested before implementation:** approve the project-scoped case model and the legacy null-project transition, then review the role matrix and database invariants. Implementation must remain blocked until dedicated staging authorization and test fixtures are explicitly approved.
