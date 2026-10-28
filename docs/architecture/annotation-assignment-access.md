# Annotation assignment and access model

This migration introduces project membership and explicit annotation assignment without moving or rewriting clinical assets.

## Roles

| Role | Read project/dataset metadata | Assign dataset items | Annotate assigned items | Review submitted annotations |
| --- | --- | --- | --- | --- |
| owner | Yes | Yes | Only if separately assigned a researcher role | Yes, except own annotations |
| principal investigator | Yes | Yes | Only if separately assigned a researcher role | Yes, except own annotations |
| researcher | Yes | No | Yes, assigned items only | No |
| reviewer | Yes | No | No | Yes, excluding their own annotations |
| viewer | Yes | No | No | No |

The database intentionally separates assignment from project membership. Being a project member does not automatically grant access to every clinical asset or annotation.

## Security properties

- Existing project owners are backfilled into `research_project_members`; new project owners are added by a trigger.
- Authorization helper functions only answer questions about the current authenticated user. They do not accept arbitrary user IDs for membership lookups.
- Membership changes are owner-only. Principal investigators may manage dataset metadata and assignments, but cannot grant project roles.
- Only assigned researchers can create annotations. Researchers can edit their own draft, submit it, and cannot edit it after submission.
- Review insertion requires a submitted annotation, a reviewer/manager role, and a reviewer who is not the annotation's author.
- Dataset-item updates are restricted to assignment/status columns, preventing clients from swapping the underlying clinical asset or moving an item to another dataset.
- Authenticated users cannot update annotation authorship, item linkage, revision numbers, or timestamps through the table API.
- RLS is defense in depth, not a substitute for validating ethics approval, consent or waiver, purpose limitation, retention, and export authorization.

## Staging verification required before production

Use at least four separate accounts: project owner, assigned researcher, reviewer, and an unrelated user. Verify that:

1. The owner can add project members and assign an item only to a researcher in the same project.
2. A researcher sees only items assigned to them, can create a draft, submit it, and cannot alter a submitted annotation.
3. A reviewer can read submitted annotations and create a review but cannot review their own annotation.
4. A viewer cannot read clinical-item/annotation content or write records.
5. A removed member loses access to project metadata, items, annotations, and reviews.
6. A user from another project cannot read or mutate records by guessing UUIDs.
7. A user cannot change `dataset_id`, `clinical_asset_id`, `annotator_id`, `revision`, or audit/review history through the Data API.

Do not apply this migration to production until those checks pass against the actual Supabase project and the app's API/UI flows are updated to match this access model.
