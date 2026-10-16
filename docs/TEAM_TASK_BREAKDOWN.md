# ProofHire — PS6 Team Task Breakdown (3 Members)

> **Tagline:** Don't just claim your skills. Prove them.  
> **Problem statement:** PS6 — Placement Hub  
> **Architecture:** Company / Hiring Partner → TechSummitTrainers Placement Hub → Students, backed by evidence, explainable matching, truthful resumes, and application tracking.

This document is the team's implementation contract for the hackathon. It divides ownership across three members, defines the stack and API handoffs, and prioritizes a complete working PS6 workflow over disconnected features.

---

## 1. Is the architecture aligned with PS6?

**Yes.** The architecture maps directly to the mandatory PS6 requirements:

| PS6 requirement | ProofHire component |
|---|---|
| Jobs arrive from company postings, alumni referrals, and legitimate APIs | Job-source adapters and `JobSource` records |
| Duplicate openings must be recognized | Duplicate detection and human review |
| Job descriptions become structured required/preferred skills | JD parsing and skill normalization |
| Student profiles use assessments, evaluated projects, and actual GitHub work | Assessment, project review, GitHub analysis, and evidence registry |
| Credentials contribute credible supporting evidence | Certificate verification workflow with issuer check or human review |
| Each skill links to proof | Evidence records and evidence-to-skill relationships |
| Students are matched to a job with explanation and gaps | Deterministic matching service |
| An entire batch can be ranked for one JD | Placement campaign ranking and shortlist review |
| Resumes are tailored, ATS-friendly, and evidence-linked | Resume generation and claim-to-evidence mapping |
| Uploaded resume claims are checked | Claim extraction and statuses: supported, needs review, contradicted by available evidence |
| Applications are tracked through interview/offer | Shared application pipeline and event history |

The company–institute–student lifecycle is the right product framing. The institute coordinates evaluation and recommendations; the company owns hiring criteria and final decisions; students supply evidence and control which evidence is shared.

**A strong architecture improves the chance of a strong demo, but cannot guarantee a hackathon win.** Judging, execution, reliability, novelty, and presentation also matter.

## 2. Final architecture

```text
COMPANY / HIRING PARTNER
  └─ Vacancy, JD, required/preferred skills, eligibility, hiring stages
                         │
                         ▼
TECHSUMMITTRAINERS PLACEMENT HUB
  ├─ Job ingestion: company submission + alumni referral + legitimate API adapter
  ├─ Job-source history, normalization, duplicate warnings and officer review
  ├─ Placement campaign and eligible student cohort
  ├─ Assessment scheduling and evaluation
  ├─ Student evidence profile:
  │    ├─ Assessment results
  │    ├─ Evaluated project evidence
  │    ├─ Selected public GitHub files/findings
  │    └─ Certificate issuer verification / manual review
  ├─ Versioned, deterministic matching and batch ranking
  ├─ Shortlist review and controlled evidence sharing
  └─ Application, interview, offer and outcome history
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
        STUDENT PORTAL          COMPANY PORTAL
  Evidence, skill gaps,       Authorized shortlist,
  truthful resume, apply      relevant evidence, interviews
  and status tracking
```

### Important boundaries

- Evidence strength and job fit are different concepts. A student can have strong skills that do not match a particular job.
- AI may extract skills or summarize repository findings; deterministic application rules control verification statuses, access permissions, scoring, and ranking.
- Missing evidence means `UNVERIFIED` or `NO EVIDENCE RECORDED`, not automatically false or unskilled.
- A certificate image alone does not prove authenticity. Check an issuer source when possible; otherwise mark it for review.
- Repository metadata or a dependency alone does not prove mastery. Inspect a limited set of relevant files and retain source references. Never execute untrusted repository code.
- A fit score is not the probability that someone will be hired. Hiring decisions remain with the company.

---

## 3. Technology stack

Use TypeScript throughout the main application to keep the team on one language and reduce 24–48-hour integration overhead. **Python is not required for the MVP**; introduce it only if a teammate already has a tested Python-only model or library that provides clear value. A separate Python service would add deployment and API-contract work without being necessary for the listed requirements.

| Layer | Chosen stack | Responsibilities |
|---|---|---|
| Web frontend | React + Vite + TypeScript | Company, placement officer, and student portals |
| UI | Tailwind CSS, shadcn/ui, Lucide React | Consistent, responsive components |
| Routing/data | React Router, TanStack Query | Role routes and server state |
| Client validation | Zod | Validate forms and API responses |
| Primary backend platform | Supabase | Managed PostgreSQL, Auth, Storage, Row Level Security |
| Database | Supabase PostgreSQL | Relational records, migrations, indexes and constraints |
| Browser data access | `@supabase/supabase-js` | Auth and RLS-protected operations |
| Server API | Node.js + Express + TypeScript | Trusted integrations, server-side validation and business operations requiring secrets |
| AI | One LLM API with structured output | Assist with JD parsing and candidate resume-claim extraction; validate every response |
| Repository evidence | GitHub REST API | Read public repository metadata, README and selected files |
| Resume files | `pdfjs-dist` for PDF text extraction; `@react-pdf/renderer` for PDF generation | Uploaded claim review and one-page resume export |
| Private documents | Supabase Storage private buckets | Certificate uploads and resume documents |
| Background tasks | A simple database-backed `analysis_jobs` table + Node worker | GitHub/LLM/document work that should not block requests |
| Testing | Vitest + Supertest; Playwright only if time allows | Unit, API and smoke tests |
| Deployment | Vercel (frontend), Supabase (data/auth/storage), Render or equivalent (Express API/worker) | Public demo |

### Backend implementation rule

Supabase is the primary backend platform for database, authentication, storage and RLS. Use Express as a **thin trusted API** for GitHub/LLM calls, document processing and workflows requiring server-side secrets. Do not build the same CRUD logic twice in Express and Supabase Edge Functions. Prefer the existing repository structure where practical and migrate it deliberately to TypeScript rather than rewriting working UI without reason.

### Environment variables

Frontend (public configuration only):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`

Server-only:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (never send to browser)
- `LLM_API_KEY`
- `GITHUB_TOKEN` (optional; use only server-side)
- `PORT`

Commit an `.env.example` with placeholders only. Never commit actual credentials.

---

## 4. Member ownership

Use the member labels below until the team confirms names. Each member owns their files and delivers working, testable increments—not only UI mockups or unfinished modules.

## Member 1 — Frontend, dashboards and user experience

**Primary ownership:** React + TypeScript UI for the three stakeholders and the connected demo journey.

### Deliverables

1. **Shared app foundation**
   - Convert/add TypeScript entry points carefully to the existing Vite project.
   - Set up React Router, role-aware layouts, reusable components, loading/empty/error states, and a consistent light dashboard design.
   - Build a typed API client; use TanStack Query if useful.
   - Do not treat frontend route guards as security; backend/RLS enforce permissions.

2. **Company portal**
   - Submit/edit a vacancy and view its required/preferred skills.
   - View the placement campaign's shared shortlist.
   - Open a candidate's permitted evidence summary.
   - View interview/application progress.

3. **Placement officer portal**
   - Create/manage a campaign and select the cohort.
   - Ingest jobs and review duplicate warnings.
   - View assessment/evidence completion states.
   - Run/view batch ranking, inspect the score breakdown and approve the shortlist.
   - Update an application's permitted stage and inspect history.

4. **Student portal**
   - Maintain profile, add projects and public repository links.
   - View assessment attempts, evidence states, and skill gaps.
   - View suitable jobs and matching explanations.
   - Review generated resume bullets and supporting evidence.
   - Upload a resume for claim review and see review reasons.
   - Apply and track status.

5. **Integration**
   - Use the shared API contracts in Section 5.
   - Replace mock data progressively. If using seed data for the demo, it must come from the database and the UI must not disguise mock analysis as a live verification.
   - Test the full workflow in a clean browser session.

### Suggested ownership paths

```text
src/
  app/
  components/
  layouts/
  features/company/
  features/placement/
  features/student/
  features/jobs/
  features/matching/
  features/resumes/
  features/applications/
  lib/api/
  lib/supabase/
  types/
```

### Definition of done

- Each role can navigate the relevant dashboard.
- Screens use real API/database data for the core demo.
- Candidate results show evidence status, a score breakdown and gaps.
- Resume preview/download and application status are connected to backend behavior.
- No secret key is included in frontend code.

---

## Member 2 — Supabase, authentication, core API, jobs and application workflow

**Primary ownership:** Database integrity, access control, trusted platform APIs, job source records and placement workflow.

### Deliverables

1. **Database and security**
   - Create Supabase migrations and a documented seed/reset procedure.
   - Add organizations/memberships, profiles, campaign/cohort, jobs/job sources, skills/job skills, evidence, match results, resumes, applications and application events.
   - Add indexes, foreign keys, unique constraints and timestamps.
   - Configure RLS on exposed tables and private Storage policies.
   - Enforce role and record ownership in the database/API; never rely only on frontend restrictions.

2. **Authentication and authorization**
   - Integrate Supabase Auth and role/membership checks.
   - Define roles such as `STUDENT`, `PLACEMENT_OFFICER`, and `COMPANY_RECRUITER`.
   - Ensure recruiters only see candidates/evidence explicitly shared with their campaign.
   - Add seeded demo accounts without committing passwords or secrets.

3. **Job ingestion and duplicate handling**
   - Support company-submitted vacancies and alumni referral submissions.
   - Implement a job-source adapter interface for one legitimate job API if credentials/terms/access are confirmed.
   - Preserve every incoming source record and link it to a canonical job.
   - Deduplicate on external ID/canonical URL first; then compare normalized company, title, location and description/skills.
   - Flag uncertain duplicates for officer review; do not destructively auto-merge them.
   - Provide seeded API-source snapshots as a clearly labelled fallback if live API access is unavailable.

4. **Campaign and application APIs**
   - Create placement campaigns linking a company vacancy to an institute-selected cohort.
   - Create/list jobs, manage source records, list campaign students, and retrieve ranking results.
   - Implement apply, prevent duplicate applications, validate job status and record every permitted status transition in `application_events`.
   - Provide the application timeline for the student and authorized placement/company users.

5. **API foundation and operational readiness**
   - Add request validation, consistent error shapes, CORS configuration, rate limiting for sensitive endpoints, health endpoint and safe production logging.
   - Keep privileged Supabase keys and external API credentials server-side.
   - Deploy a minimum working version early and document environment setup.

### Suggested ownership paths

```text
supabase/
  migrations/
  seed.sql
server/src/
  app.ts
  routes/
  middleware/
  modules/auth/
  modules/organizations/
  modules/campaigns/
  modules/jobs/
  modules/applications/
  modules/storage/
  utils/
```

### Definition of done

- A clean database can be migrated and seeded.
- Student and company/placement access restrictions pass negative tests.
- The three job input types can be demonstrated: company, alumni referral and API adapter/snapshot.
- Duplicate warnings preserve the original source records.
- Application stages are auditable, permissions enforced, and the deployed health check works.

---

## Member 3 — Evidence engine, assessments, AI integrations, matching and resume intelligence

**Primary ownership:** Skill normalization and the evidence-based logic that makes ProofHire distinct.

### Deliverables

1. **Skill catalogue and job parsing**
   - Create canonical skills and alias mappings (e.g. ReactJS / React.js / React → React).
   - Use token-aware matching, not unsafe substring checks.
   - Parse required versus preferred skills into a validated schema.
   - Use an LLM only as an assistive parser; validate returned skills against the catalogue and allow officer correction.
   - Coordinate the parser contract with Member 2's job endpoint.

2. **Assessment and project evidence**
   - Implement a small, automatically graded MCQ assessment for selected skills.
   - Store attempt, score, assessment/version, timestamp and skill associations.
   - Define a simple project-evaluation rubric with reviewer, rationale and score.
   - Do not implement arbitrary code execution inside Express. A coding judge is a stretch unless a safe external sandbox is already available.

3. **GitHub repository analysis**
   - Validate public repository URLs and safely parse owner/repository.
   - Retrieve repository metadata, README, manifests and a small number of selected files.
   - Produce findings linked to actual file URLs and analysis timestamps.
   - Label automated findings as `EVIDENCE_FOUND` / `NEEDS_REVIEW` until the defined review process is completed; metadata alone is not proof of mastery.
   - Handle missing/private/large repositories, network errors and rate limits. Never execute repository code.

4. **Certificate credibility workflow**
   - Extract basic issuer/name/ID/issue/expiry fields where possible.
   - Check an issuer verification URL/API when available; otherwise require manual review.
   - Store provenance and clear states such as `ISSUER_VERIFIED`, `MANUALLY_REVIEWED`, `UNVERIFIABLE`, `NEEDS_REVIEW`.
   - A certificate supports a credential claim; it cannot alone prove practical proficiency.

5. **Evidence registry and matching**
   - Normalize evidence by student and canonical skill.
   - Keep source, review status, reviewer/analysis version and timestamp.
   - Implement the matching calculation as a pure, deterministic, unit-tested TypeScript service.
   - Start with required skills = 80% and preferred skills = 20%; when a JD has no preferred skills, use the required-skill score as the total.
   - Require at least one required skill; otherwise return a validation error.
   - Return overall score, matched skills, partial/insufficient evidence, missing evidence, preferred gaps, source references, explanation and `policyVersion`.
   - Describe scores as job fit under a documented policy, never as hiring probability.

6. **Truthful resume generation and upload claim review**
   - Generate tailored one-page resume content only from structured profile data and supported records.
   - Link every generated bullet to one or more evidence IDs.
   - Extract text from uploaded PDFs and identify candidate factual claims.
   - Display `SUPPORTED`, `NEEDS_REVIEW`, or `CONTRADICTED` only when the available evidence supports that classification. Missing data must not be labelled false.
   - Use deterministic evidence checks and human review for ambiguous claims; an LLM alone must not decide that a student lied.

### Suggested ownership paths

```text
server/src/
  modules/skills/
  modules/assessments/
  modules/evidence/
  modules/github/
  modules/certificates/
  modules/matching/
  modules/resumes/
  services/skillNormalizer.ts
  services/matchingPolicy.ts
  services/resumeClaims.ts
```

### Definition of done

- Known skill aliases normalize consistently.
- Assessment results and project/GitHub/certificate findings can be traced to a student and skill.
- A test fixture produces a known, reproducible batch ranking.
- Score explanations agree with the computed score.
- Generated resume bullets have evidence references; unsupported uploaded claims are flagged for review without treating absence as proof of falsity.
- AI/GitHub unavailability results in a clear fallback state, not a broken demo.

---

## 5. Shared API contracts and handoffs

Agree on these formats before implementing screens and services. The exact route prefixes can be adjusted once, but do not let separate members invent incompatible field names.

### Job parsing response

```json
{
  "jobId": "job-demo-001",
  "requiredSkills": [
    { "skillId": "skill-react", "canonicalName": "React", "sourceText": "ReactJS" }
  ],
  "preferredSkills": [
    { "skillId": "skill-postgres", "canonicalName": "PostgreSQL", "sourceText": "Postgres" }
  ],
  "needsOfficerReview": false
}
```

### Batch matching response

```json
{
  "campaignId": "campaign-demo-001",
  "policyVersion": "v1",
  "results": [
    {
      "studentId": "student-demo-001",
      "fitScore": 82,
      "matchedSkills": ["React"],
      "partialEvidenceSkills": ["Node.js"],
      "noEvidenceSkills": ["PostgreSQL"],
      "explanation": "Strong React assessment and project evidence; PostgreSQL evidence is not recorded.",
      "evidenceRefs": ["evidence-demo-001"]
    }
  ]
}
```

These are contract examples, not real candidate results. The server must compute them from seeded or live database records.

### API ownership

| Contract / endpoint family | Owner | Consumer |
|---|---|---|
| Auth/session/profile and role context | Member 2 | Member 1 |
| Job CRUD, job sources, duplicate-review decisions | Member 2 | Members 1 and 3 |
| Parse/normalize JD | Member 3 service; integrated behind Member 2 job API | Members 1 and 2 |
| Assessment/evidence/GitHub/certificate results | Member 3 service, persisted through agreed schema | Members 1 and 2 |
| Match run and candidate explanations | Member 3 logic; API mounted by Member 2 | Members 1 and 2 |
| Resume generation/claim review | Member 3 logic; upload/storage permissions coordinated with Member 2 | Member 1 |
| Applications/status events | Member 2 | Members 1 and 3 |
| API schemas/types and errors | Joint; Member 2 maintains server contract | All |

Do not make every member edit the same central file. Members export route modules/services and Member 2 mounts them in the central Express app. Share types through `src/types/` or a small `shared/` folder if the repository layout supports it.

---

## 6. Integration rules and Git workflow

1. Use one branch per feature, for example:
   - `feature/role-dashboards`
   - `feature/supabase-auth-schema`
   - `feature/job-ingestion-dedupe`
   - `feature/evidence-matching`
   - `feature/resume-claims`
2. Do not commit `.env`, tokens, service-role keys, or private student files.
3. Add a migration for every schema change and keep seed data repeatable.
4. Every API request validates input; every protected route checks identity, role and ownership/sharing permission.
5. Pull and run the latest integrated branch at least every few hours; do not wait until the final hour.
6. Commit small working changes. Merge only after the relevant test or a manual smoke test passes.
7. If there is a conflict, the schema/API contract is authoritative; discuss changes before renaming fields.
8. Use stable seed fixtures for demos, and identify seeded/snapshot data honestly.

---

## 7. Build schedule for a 24-hour hackathon

| Time | Shared milestone | Member 1 | Member 2 | Member 3 |
|---|---|---|---|---|
| Hours 0–2 | Freeze schema, roles, contracts and score policy | App shell and role layouts | Supabase schema, Auth/RLS, API skeleton | Skill catalogue and test fixtures |
| Hours 2–5 | Seeded company → institute → cohort flow | First dashboards and navigation | Jobs, source records, campaign APIs | JD parsing/normalization and alias tests |
| Hours 5–8 | Job requirements and student evidence visible | Connect job/evidence views | Company/alumni/API-source inputs and duplicate flags | MCQ assessment + evidence records + limited GitHub path |
| Hours 8–12 | **Critical checkpoint: reproducible batch ranking** | Ranking table and evidence drill-down | Match/campaign API integration, permission tests | Matching policy, skill gaps, explanation tests |
| Hours 12–16 | Truthful resume and application journey | Resume Studio and application tracker | Applications, status events, secure file storage | Resume generation and uploaded-claim review |
| Hours 16–20 | Mandatory-source and edge-case coverage | Polish errors/loading/responsive states | Validate source provenance, RLS and deployment | Certificate review flow, test failures and fallbacks |
| Hours 20–24 | Freeze, deploy and rehearse | Full demo smoke test | Production settings and database verification | Verify scores, resume claims and AI fallbacks |

**At the end of Hour 12, a placement officer must be able to run a job against the batch and inspect an evidence-backed ranked result.** If not, stop optional work and finish that vertical slice.

For a 48-hour event, use the additional time to improve live API ingestion, stronger project evaluation, issuer verification, upload robustness, analytics, and accessibility. Build optional recruiter/alumni/interview-question-bank features only after mandatory PS6 workflows pass.

---

## 8. Required demo data and acceptance scenario

Seed a consistent demo with:
- One hiring company and one TechSummitTrainers placement campaign.
- At least five students with intentionally different assessment/project/GitHub evidence.
- One JD with both required and preferred skills.
- Multiple source records representing company posting, alumni referral, and API import/snapshot; make at least two represent the same job so deduplication can be demonstrated.
- Canonical skills and variants such as ReactJS, React.js, React, NodeJS and Postgres.
- One issuer-verified or manually reviewed credential and one credential needing review.
- A generated resume whose bullets are linked to evidence and an uploaded sample containing an unsupported claim.
- Applications in different pipeline stages.

Run this story from the deployed app:

1. Company submits a vacancy; placement team imports another source for the same vacancy and reviews the duplicate warning.
2. Officer checks normalized skills and assigns the cohort.
3. Student assessment and evidence records appear in the skill profile.
4. Officer runs batch matching and clicks a skill/evidence reference to inspect the reason.
5. Student generates a job-specific resume and sees claim evidence.
6. Uploaded sample resume produces a review warning for an unsupported claim—not an automatic accusation of fraud.
7. Student applies; an authorized officer moves the application to Interview; student sees the recorded update.

---

## 9. Non-negotiable security and fairness checks

- RLS enabled and tested on exposed tables; server-only keys stay on the server.
- Recruiters see only candidates and evidence explicitly shared for their campaign.
- No execution of uploaded code or submitted repositories on the application server.
- File size/type limits, private storage and access checks for uploaded resumes/certificates.
- Do not use protected demographic attributes to rank candidates.
- Version scoring rules and store the rule version with each match run.
- Do not silently merge uncertain job duplicates or silently override eligibility.
- A missing certificate/project/skill record is not automatically evidence that the student is dishonest or incapable.
- Log sensitive placement actions with actor and timestamp; avoid logging secrets or full private documents.

---

## 10. Definition of done

The PS6 MVP is ready for judging when the team can demonstrate all of the following in a single deployed session:

- [ ] Company, placement officer and student have distinct role-aware experiences.
- [ ] Job entries can represent company submissions, alumni referrals and a legitimate API source/clearly labelled fallback snapshot.
- [ ] Duplicate openings are flagged while source history is preserved.
- [ ] Required/preferred skills are extracted and canonicalized.
- [ ] Student skills link to assessment, evaluated project, selected GitHub and credential evidence where present.
- [ ] One JD ranks the entire demo cohort with reproducible scores, explanations, gaps and evidence references.
- [ ] A one-page ATS-friendly resume is generated from supported data and each bullet is traceable.
- [ ] Uploaded-resume claims can be flagged for review without treating absent evidence as proof of falsity.
- [ ] An application moves through the shared pipeline and every transition is recorded.
- [ ] RLS/role tests, health check, deployed API and clean-browser smoke test pass.
- [ ] The team can complete the connected demo in roughly three minutes.

**Build the smallest credible implementation of every mandatory PS6 workflow, then polish the end-to-end story.** Reliability, traceable evidence, clear explanations and a live integrated demo matter more than adding every optional feature.
