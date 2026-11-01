# JinoX AI — Product & Design Specification

> Purpose: establish a shared product, interaction, and visual-design direction for JinoX AI. This is a design contract for future implementation, not a claim that every described screen or capability already exists.

## 1. Product north star

JinoX AI is building data infrastructure for East African oral-health research. Its first job is to help authorized teams **register, govern, curate, annotate, review, version, and securely share research datasets**.

The long-term scientific vision includes multimodal oral-health datasets, foundational models, biological simulation, genomics, low-resource deployment, and climate-health intelligence. Those are research directions and potential future capabilities—not features to imply are available or clinically validated today.

### Product promise

**Make high-quality, responsibly governed oral-health data easier to produce and reuse.**

A successful user should be able to answer:
- What data is in this project, and where did it come from?
- Is its use authorized for this purpose?
- What work remains before it can be released?
- Who annotated and reviewed it, under which guideline version?
- What quality limitations should a downstream researcher know?
- Who accessed or exported the dataset?

### Out of scope for the current product

- Autonomous diagnosis or treatment recommendations.
- Presenting experimental models, genomic risk estimates, or digital-twin outputs as validated clinical tools.
- Treating a record count as proof of dataset quality.
- Making patient-derived files public by default.
- Claiming a dataset is open-access before rights, consent, ethics, and release terms have been verified.

## 2. Users and jobs to be done

| User | Primary job | Design priority |
| --- | --- | --- |
| Project owner / principal investigator | Set up a project, govern access, oversee quality and approve release | Clear project health, ownership, approvals and audit trail |
| Data curator | Intake, pseudonymize where appropriate, check completeness and resolve data issues | Efficient queues, actionable validation errors and provenance |
| Annotator / researcher | Complete assigned work consistently using documented guidelines | Focused annotation workspace, minimal distractions and visible instructions |
| Independent reviewer | Assess submitted labels, record disagreements and request corrections | Clear evidence, explicit review criteria and no self-review |
| Data steward / ethics lead | Verify permitted use, consent or waiver, retention and sharing constraints | Governance status and traceable decisions |
| Dataset consumer | Discover released datasets, understand limitations and request permitted access | Trustworthy metadata, quality reports and transparent licensing |

A person may hold more than one role across different projects. Permissions must be project-scoped and enforced by the server and database—not inferred from UI visibility alone.

## 3. Information architecture

Keep the primary navigation small and task-oriented:

1. **Overview** — work in progress, review backlog, recent activity, governance blockers.
2. **Projects** — project purpose, team, access, governance, and linked datasets.
3. **Datasets** — dataset metadata, intake status, curation, annotations, review, versions.
4. **Tasks** — work assigned to the current user, due dates if configured, and task status.
5. **Quality & Releases** — quality sampling, disagreement/adjudication summaries, release manifests and version history.
6. **Audit & Governance** — permissions, approvals, access/export events, retention and withdrawal records; visible only to authorized roles.
7. **Settings** — profile, organization and project-level preferences permitted to the current user.

Do not show navigation items that a user cannot access, but still enforce all access rules server-side. Use clear empty states to explain how an authorized user can begin.

## 4. Core workflows

### 4.1 Project setup

1. Enter a clear project name and research purpose.
2. Record responsible institution, data steward, ethics determination, consent or other lawful basis, permitted use, retention and sharing constraints.
3. Invite collaborators and assign the minimum required project roles.
4. Keep the project in a blocked or pending-governance state until required information is reviewed.
5. Show outstanding requirements as a checklist with owners and timestamps.

A checkbox or self-attestation is not proof of formal ethics approval. Store the approval reference and review status according to the project's governance process.

### 4.2 Dataset registration and intake

1. Register dataset metadata: name, description, modality, source type, license/rights status, record-count estimate and associated project.
2. Display the current authorization and readiness state.
3. Upload or import data through an authorized intake path.
4. Validate file type, size, structure, duplicate identifiers, required metadata and provenance.
5. Record issues and allow authorized curators to resolve them without erasing the original audit history.

Use terms such as **registered**, **intake in progress**, **needs attention**, and **curation complete**. Avoid implying clinical validity from an intake status.

### 4.3 Annotation and review

1. A project manager assigns eligible items to a qualified researcher.
2. The annotator sees only authorized assigned work and the current guideline/schema version.
3. The annotator records labels, optional notes, and a reason for uncertainty when appropriate.
4. Submission freezes that annotation revision for independent review.
5. A reviewer who is not the original annotator accepts the work, requests changes, or records a disagreement.
6. Disputed labels go through an explicit adjudication path; preserve prior revisions and decisions.

Show the distinction between **not started**, **in progress**, **submitted**, **changes requested**, **reviewed**, and **adjudicated**. Avoid ambiguous status labels such as “done” when review is still pending.

### 4.4 Dataset release

A release is a deliberate, permissioned action—not a side effect of completing annotation.

Before release, present a review screen covering:
- governance and permitted-use approval;
- dataset scope and inclusion/exclusion criteria;
- label dictionary and guideline versions;
- quality checks and relevant inter-annotator agreement;
- unresolved disagreement and adjudication counts;
- duplicate/leakage checks and split methodology where relevant;
- provenance, version identifier, manifest and checksums;
- known limitations, representation gaps and intended uses;
- license, access restrictions, retention/withdrawal obligations and approver.

If a required gate is incomplete, disable release and explain exactly what is missing. Never silently downgrade a release gate.

## 5. Key screens and layout

### Overview dashboard

Prioritize work over vanity metrics:
- **Needs your action:** assignments, review requests, missing governance evidence.
- **Project status:** stage, owner, next milestone and blockers.
- **Dataset pipeline:** registered → intake → curation → annotation → review → release.
- **Recent audit activity:** concise events with timestamps and actor identity.
- **Quality signals:** clearly scoped counts and measures, with definitions and denominators.

Do not show invented impact statistics, model accuracy, or aggregate counts unless derived from real data and labelled with the relevant time range.

### Project workspace

Use a consistent project header containing project name, status, owner and access scope. Tabs may include Overview, Datasets, Team & Access, Governance, and Activity. Make governance blockers visible without overwhelming the routine workflow.

### Dataset workspace

Use a dataset header with modality, source, project, lifecycle status and version. A secondary navigation can separate:
- Summary
- Items / intake
- Curation issues
- Annotation
- Review & adjudication
- Quality
- Versions & exports
- Governance / activity

Keep metadata separate from sensitive source content. Do not place patient identifiers in titles, breadcrumbs, browser URLs, toast notifications, or general activity feeds.

### Annotation workspace

Optimize for careful, repeatable work:
- One item and its permitted evidence at a time.
- Persistent guideline and schema version.
- Labels grouped by task, with keyboard navigation where safe and accessible.
- Clear save state and explicit submit action.
- A visible uncertainty / flag-for-review mechanism where the task supports it.
- No accidental submission from keyboard shortcuts.
- No access to another annotator's private drafts unless the workflow explicitly authorizes it.

### Review workspace

Show the submitted annotation, required evidence, rubric, and review actions. Separate factual correction from reviewer opinion. Require a reason for rejection or requested changes when configured. Prevent self-review both in the interface and at the authorization layer.

### Dataset catalogue and release details

Only show released datasets to catalogue audiences authorized by their access terms. Each dataset detail page should explain:
- scope and modality;
- provenance and collection context;
- label schema and version;
- quality report and limitations;
- permitted use and access process;
- release date, version and checksum;
- contact or steward role, without exposing private personal contact details by default.

## 6. Visual design direction

### Brand character

- **Scientific:** precise, calm, evidence-led.
- **African-context-aware:** represent Kenya and East Africa as research leaders, not merely as a source of data.
- **Trustworthy:** governance and limitations are visible, not hidden in footnotes.
- **Modern and restrained:** polished research software, not a consumer-health marketing page.
- **Accessible:** clarity and legibility take precedence over decoration.

### Suggested visual system

The application uses a deliberately restrained black, white and neutral-gray palette. Hierarchy comes from typography, spacing, borders and surface contrast—not saturated accent colors, gradients or decorative effects.

| Token | Value | Usage |
| --- | --- | --- |
| Primary | Near-black #090909 | Primary actions, active navigation and key emphasis |
| Secondary | Charcoal #171717 | Headings and high-priority text |
| Canvas | White #FFFFFF | Main application background |
| Surface | Soft white #FAFAFA | Secondary panels and quiet work areas |
| Text | Near-black #171717 | Main content |
| Muted text | Neutral gray #737373 | Supporting labels and metadata |
| Border | Light gray #E5E5E5 | Dividers, tables and field outlines |
| Subtle surface | Neutral #F5F5F5 | Hover states, quiet status panels and selected rows |
| Focus | Black #090909 | Visible keyboard focus indicator |

Use monochrome status treatments with explicit text and accessible icons. Permission, risk, validation and quality states must never depend on hue alone. Validate contrast against WCAG 2.2 AA. Avoid excessive gradients, glassmorphism, glowing AI effects, saturated status colors and decorative charts that obscure real work.

### Typography and spacing

- Use a highly legible sans-serif already available in the project; avoid adding a font dependency without a clear benefit.
- Establish a compact, consistent type scale: page title, section heading, body, helper text and metadata.
- Use a spacing scale based on 4px increments.
- Keep dense tables readable with clear column labels, row actions, responsive overflow and persistent headers where useful.
- Use charts only when they answer a real operational or scientific question; label units, time range, denominator and missing data.

### Components

Build on existing components before introducing a new UI library. Standardize:
- App shell and navigation
- Page header and breadcrumbs
- Status badge with text label
- Summary metric with source/period
- Data table with loading, empty and error states
- Filter/search controls
- Form field with helper/error text
- Confirmation dialog for destructive or irreversible actions
- Activity/audit timeline
- Governance checklist
- Annotation label controls
- Review decision panel
- Version and release manifest panel
- Permission-aware action menu

## 7. Interaction and content rules

- Prefer explicit verbs: **Register dataset**, **Assign items**, **Submit annotation**, **Request changes**, **Approve release**, **Export dataset**.
- Explain why an action is unavailable and what permission or requirement is missing.
- Use confirmation dialogs for removal, release, withdrawal, and exports of sensitive data.
- Show save state and distinguish saved drafts from submitted work.
- Preserve user input after validation errors where safe.
- Use optimistic UI only for reversible, low-risk actions. For permission changes, review decisions, release and export, wait for server confirmation.
- Never expose raw database errors, access tokens, signed URLs, internal stack traces, or sensitive metadata in user-facing messages.
- Use neutral, non-stigmatizing language for disease labels and patient context.
- Do not describe AI-generated labels as ground truth; preserve provenance and human review status.

## 8. Privacy, security and trust by design

- Patient-derived assets remain private by default.
- Pseudonymized data is still sensitive data; do not label it anonymous unless that conclusion has been formally established.
- Verify identity, project membership, role, purpose and asset-level authorization server-side before data access.
- Use Row Level Security as a defense-in-depth control and test cross-project isolation with separate accounts.
- Use short-lived signed URLs for private files; do not persist them in records, logs, analytics, or browser-visible audit trails.
- Minimize data in notifications, URLs, analytics and logs.
- Record access, assignment, annotation revision, review, release, and export events with actor, timestamp, object, action and outcome.
- Apply retention, withdrawal and deletion rules to originals, derived files, exports and downstream obligations.
- Keep commercial contributor compensation separate from clinical labels, reviewer decisions and quality metrics.

## 9. Accessibility and responsive behavior

- Target WCAG 2.2 AA.
- Ensure complete keyboard access, visible focus, logical heading order, labelled form controls and accessible validation feedback.
- Use semantic HTML and announce async status changes to assistive technology.
- Do not rely on hover alone to expose important actions.
- At small widths, collapse navigation predictably, preserve primary actions and convert wide tables into deliberate responsive views rather than silently hiding important columns.
- Respect reduced-motion preferences and avoid animation that slows repeated annotation tasks.

## 10. Loading, empty, error and restricted states

Every major data screen must design for:
- **Loading:** stable skeleton or progress indicator without fake values.
- **Empty:** explain why the list is empty and the next authorized action.
- **Partial:** show what loaded and what failed; do not imply completeness.
- **Validation error:** identify the field and a practical correction.
- **Permission denied:** explain that access is unavailable without revealing whether a sensitive record exists.
- **Expired session / signed URL:** provide a safe retry path without exposing credentials.
- **Network failure:** preserve unsent work where safe and make retry behavior explicit.
- **Governance blocked:** show missing requirements and who can resolve them.
- **Conflict:** if a record changed elsewhere, explain the conflict and avoid overwriting another user's work.

## 11. Measurement

Use operational measures that improve quality and safety:
- Intake rejection and remediation rates.
- Time from intake to curation completion.
- Annotation completion and reviewer turnaround.
- Inter-annotator agreement with the metric and sample definition stated.
- Disagreement and adjudication rates.
- Missing provenance/governance evidence.
- Export approvals, denials and audit completeness.
- Accessibility and cross-project authorization test results.

Do not optimize solely for records processed per hour. Quality, representativeness, lawful use, reviewer independence and downstream usability matter more than raw throughput.

## 12. Delivery sequence

### Now — trustworthy data operations
- Align app navigation and copy with the dataset-first scope.
- Standardize project and dataset views.
- Implement governed intake and clear lifecycle states.
- Add role-aware assignment, annotation, review and audit surfaces.
- Ensure private storage and authorization checks match the UX.

### Next — quality and controlled release
- Version annotation guidelines and labels.
- Add disagreement/adjudication history and quality reports.
- Create immutable dataset manifests and controlled export flows.
- Add integration tests for RLS, signed URLs, exports and role boundaries.

### Later — research intelligence
- AI-assisted pre-labeling with human verification and provenance.
- Multimodal dataset discovery and research APIs.
- Carefully validated research models, environmental analysis, genomics and simulation capabilities.
- Low-resource deployment only after appropriate clinical validation, safety review and regulatory assessment.

## 13. Definition of done for design changes

A significant UI workflow is ready when:
- Its intended user and permission requirements are documented.
- Loading, empty, error, restricted and success states are designed.
- Sensitive data exposure has been reviewed.
- Keyboard and responsive behavior are usable.
- Labels and metrics are defined and not fabricated.
- Server/database authorization matches the visible affordances.
- Relevant automated tests and a Vercel preview have been checked.
- Documentation describes any remaining limitations.

---

**Design principle:** JinoX should make responsible research data operations feel clear and efficient without making sensitive health data, uncertain labels, or unvalidated science appear simpler or more certain than they are.
