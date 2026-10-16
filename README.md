# ProofHire — Evidence-First Placement Hub

> **Don't just claim your skills. Prove them.**

ProofHire is an AI-assisted placement platform that helps students discover suitable jobs, connect skills to supporting evidence, create truthful job-specific resumes, and track applications. It also helps placement teams manage openings, identify duplicate listings, and build explainable candidate shortlists.

Built as a **24-hour hackathon MVP** for the Placement Hub problem statement.

---

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Core Features](#core-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Suggested Project Structure](#suggested-project-structure)
- [Database and Security](#database-and-security)
- [Matching Approach](#matching-approach)
- [Team Collaboration](#team-collaboration)
- [MVP Scope and Roadmap](#mvp-scope-and-roadmap)
- [Important Principles](#important-principles)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem

Students often apply to many jobs using a generic resume with skill claims that may not be supported by projects or practical work. At the same time, placement teams receive openings from different sources, deal with duplicate listings, manually forward jobs, and struggle to track application outcomes. Recruiters need shortlists that are supported by evidence—not just matching keywords.

## Our Solution

ProofHire connects **job requirements, candidate skills, evidence, resumes, and application outcomes** in one workflow.

- Students build an evidence-backed profile using projects, assessments, and permitted GitHub evidence.
- Job descriptions are converted into structured requirements and skill names are normalized.
- Matching results explain strengths and skill gaps instead of showing only a score.
- Resume claims are linked to supporting evidence, and unsupported claims are flagged for review.
- Students and authorized placement staff can track application progress in one place.

## Core Features

### For Students
- Create and maintain a candidate profile.
- Add projects, skills, assessment results, and permitted repository links.
- View evidence associated with each skill.
- Discover jobs and see an explainable fit score.
- Understand missing required and preferred skills.
- Generate a job-specific, ATS-friendly resume from supported profile information.
- Review resume claims that need more evidence.
- Track application status and history.

### For Placement Officers
- Add jobs manually or from supported sources.
- Extract and normalize required and preferred skills.
- Identify likely duplicate openings for review.
- Rank a student batch against a job description.
- Inspect relevant evidence behind match results.
- Update and monitor application stages.

### Optional Extensions
- Recruiter-facing shortlist and evidence-sharing portal.
- Alumni referrals.
- Interview question bank.
- More job-source integrations and placement analytics.

> Optional extensions should not block the core hackathon demo.

---

## How It Works

```text
Student Profile
      |
      +--> Projects, Assessments, Permitted GitHub Evidence
      |                         |
      |                         v
      |                 Evidence-backed Skills
      |
Job Description --> Skill Extraction --> Skill Normalization
                                            |
                                            v
                                Explainable Matching Engine
                                            |
                         +------------------+------------------+
                         |                                     |
                  Student Job Matches                   Batch Ranking
                         |
                         v
                 Evidence-backed Resume
                         |
                         v
                   Job Application
                         |
                         v
             Applied → Shortlisted → Interview
                         |
                    Offer / Rejected
```

### Typical user journey

1. A student signs in and adds profile details and projects.
2. ProofHire records available evidence and assessment results.
3. A placement officer adds a job description.
4. The system extracts skills, maps known aliases to canonical names, and checks for possible duplicates.
5. The matching engine compares job requirements with candidate evidence.
6. The student sees a fit score, matched skills, evidence, and specific gaps.
7. The student generates and reviews a tailored resume.
8. The student applies and follows the application pipeline.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Student portal and placement dashboard |
| Styling | Tailwind CSS | Responsive UI |
| Database | Supabase PostgreSQL | Relational application data |
| Authentication | Supabase Auth | Sign-up, login, and sessions |
| Authorization | PostgreSQL Row-Level Security (RLS) | Data access control |
| Supabase client | `@supabase/supabase-js` | Auth, database API, and storage access |
| Backend | Node.js + Express | Server-side logic, repository analysis, orchestration, and AI integrations |
| AI integration | LLM API | Assist with job parsing, claim review, and natural-language explanations |
| Repository integration | GitHub API | Retrieve permitted repository metadata/evidence |
| Coding assessments (optional) | Judge0 or an isolated execution environment | Run submissions outside the application server |
| File storage | Supabase Storage | Private reports and permitted artifacts |
| Version control | Git + GitHub | Team collaboration |

**Architecture note:** Supabase provides managed PostgreSQL along with Auth, Storage, and APIs. PostgreSQL is still the relational database. The React application should never contain service-role keys or other server secrets.

---

## System Architecture

```text
┌───────────────────────────┐
│      React + Vite         │
│  Student / Placement UI   │
└─────────────┬─────────────┘
              │
       Supabase client
              │
     ┌────────┴─────────┐
     │                  │
     v                  v
┌───────────────┐  ┌────────────────┐
│ Supabase Auth │  │ PostgreSQL +   │
│               │  │ RLS            │
└───────────────┘  └────────────────┘
              │
              │ Authenticated requests
              v
┌───────────────────────────┐
│       Express API         │
│                           │
│ Job parsing/normalization │
│ Matching and explanations│
│ GitHub evidence service   │
│ Resume claim validation  │
│ AI integrations           │
└─────────────┬─────────────┘
              │
       ┌──────┴────────┐
       v               v
  LLM API         GitHub API
```

Use the Supabase client for operations protected by RLS. Use Express for secrets, privileged integrations, and operations that require server-side validation. Validate identity and authorization on every protected backend route.

---

## Getting Started

The commands below are a suggested setup for a fresh repository. Adjust directory names if your team has already created a different structure.

### Prerequisites

Install the following:

- Node.js (current LTS version recommended)
- npm
- Git
- A Supabase project
- An LLM API key if AI-powered features are enabled
- A GitHub token only if a feature requires authenticated GitHub API access

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

Replace the placeholders with your repository URL and directory name.

### 2. Create the React frontend

If the frontend has not been created yet:

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite
```

Configure Tailwind according to the installed version's official setup instructions, then start the frontend:

```bash
npm run dev
```

Vite prints the local development URL in the terminal, commonly `http://localhost:5173`.

### 3. Create the Express backend

From the repository root:

```bash
mkdir server
cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js
npm install -D nodemon
```

Create an entry file such as `src/index.js`, configure environment variables, and add a development script to `server/package.json`, for example:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

Then run:

```bash
npm run dev
```

The actual API port and available scripts depend on the implementation in your repository.

### 4. Configure Supabase

1. Create a Supabase project.
2. Use the SQL editor or migrations to create the tables required by the app.
3. Configure authentication providers.
4. Add Row-Level Security policies to tables that contain user data.
5. Create private storage buckets for files that should not be publicly accessible.
6. Add the required project URL and publishable key to the frontend environment.

Do not assume that hiding a button in the UI protects the data. Access must be enforced by RLS and backend authorization.

### 5. Run the application

Run the frontend and backend in separate terminals:

```bash
# Terminal 1
cd client
npm run dev
```

```bash
# Terminal 2
cd server
npm run dev
```

This is a setup template; it does not imply that all features, migrations, or scripts have already been implemented.

---

## Environment Variables

Create local environment files and keep them out of Git.

### `client/.env.local`

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_BASE_URL=http://localhost:3000
```

### `server/.env`

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
LLM_API_KEY=your_llm_api_key
GITHUB_TOKEN=your_github_token_if_required
```

**Security requirements**
- Never commit `.env`, `.env.local`, tokens, or credentials.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `LLM_API_KEY`, or `GITHUB_TOKEN` through a `VITE_` variable.
- Keep service-role access on the server only and use it only where necessary.
- Prefer the publishable key in the browser with correctly configured RLS policies.
- Add `.env.example` files containing placeholders, not real credentials.

Variable names may need to be adjusted to match the actual code.

---

## Suggested Project Structure

```text
proofhire/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── lib/
│       │   └── supabase.js
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── services/
│       │   ├── jobParser.js
│       │   ├── skillNormalizer.js
│       │   ├── matchingService.js
│       │   ├── evidenceService.js
│       │   └── resumeService.js
│       ├── utils/
│       └── index.js
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/
├── .gitignore
└── README.md
```

This is a recommended layout, not a requirement. Keep the structure already agreed on by your team if the repository exists.

---

## Database and Security

Suggested core entities:

| Table | Purpose |
|---|---|
| `profiles` | Candidate details and user role |
| `skills` | Canonical skill catalog |
| `skill_aliases` | Variants such as `ReactJS`, `React.js`, and `React` |
| `projects` | Candidate projects |
| `student_evidence` | Evidence references linked to a candidate and skill |
| `assessments` | Assessment definitions |
| `assessment_results` | Assessment attempts and evaluated results |
| `jobs` | Canonical job openings |
| `job_sources` | Source URLs and ingestion metadata for job records |
| `job_skills` | Required/preferred job skills |
| `match_results` | Fit scores and explanations |
| `resumes` | Generated resume versions |
| `resume_claims` | Resume statements and review status |
| `resume_claim_evidence` | Links claims to supporting evidence |
| `applications` | Candidate-job applications |
| `application_events` | Status-change history |

### Suggested evidence states

- `VERIFIED` — reviewed evidence supports the stated claim within a defined scope.
- `EVIDENCE_FOUND` — relevant evidence exists but has not been fully reviewed.
- `UNVERIFIED` — insufficient evidence is currently available.
- `NEEDS_REVIEW` — conflicting or ambiguous information requires human review.

Use database constraints, indexes, RLS policies, and server-side validation. Restrict candidates to their own private records and allow placement/recruiter access only where the relevant role and sharing policy permit it.

---

## Matching Approach

ProofHire should prioritize explainability over a mysterious AI-generated score.

A simple initial model can use:

- **Required skills: 80%**
- **Preferred skills: 20%**

For each skill, calculate a documented evidence score based on the evidence types and review state. Aggregate required and preferred skill scores separately, then combine them. If a job has no preferred skills, define a clear fallback so the score remains meaningful.

The result should show:
- Overall fit score.
- Required skills with strong evidence.
- Skills with partial or unreviewed evidence.
- Missing or unverified requirements.
- Preferred-skill gaps.
- Evidence references and a plain-language explanation.

Keep the initial scoring rules deterministic and testable. Use an LLM to help parse text or draft explanations—not as the sole authority for ranking candidates.

**Important:** A fit score describes alignment with the listed requirements; it is **not** a probability of getting hired. A missing evidence record means *unverified*, not automatically *false*. Repository metadata alone does not prove proficiency.

---

## Team Collaboration

For a three-person hackathon team, agree on API contracts and database fields early.

| Team member | Primary ownership | Deliverables |
|---|---|---|
| Member 1 — Frontend | React UI and user experience | Student dashboard, job list/details, match explanation, resume view, application tracker |
| Member 2 — Backend and integration | Express API, Supabase schema/RLS, authentication and integration | Database migrations, protected endpoints, job/application CRUD, integration support |
| Member 3 — Matching and AI | Evidence, parsing, normalization, matching, resume validation | Job-skill extraction, skill aliases, evidence mapping, fit score and gaps, claim review |

### Git workflow

1. Keep one shared repository.
2. Create feature branches, such as `feature/student-dashboard`, `feature/jobs-api`, and `feature/matching-engine`.
3. Commit small, focused changes.
4. Open pull requests or review changes before merging into `main`.
5. Agree on endpoint request/response formats before parallel implementation.
6. Integrate early—do not wait until the final hours.
7. Keep `.env` files and private keys out of commits.

---

## MVP Scope and Roadmap

### Must-have for the demo
- [ ] Authentication and role-aware access
- [ ] Candidate profile and project/evidence entry
- [ ] Job creation or job-description input
- [ ] Skill extraction and normalization
- [ ] Basic duplicate-job detection
- [ ] Explainable candidate-job matching
- [ ] Resume generation with claim/evidence review
- [ ] Application status tracking
- [ ] Sample/demo data and a complete end-to-end flow

### If time permits
- [ ] GitHub API integration
- [ ] Recruiter-facing shortlist
- [ ] Alumni referrals
- [ ] Coding assessments with a secure execution provider
- [ ] Analytics and interview question bank
- [ ] More job-source integrations

Build a reliable end-to-end path first. It is better to demonstrate a small workflow that works than a long feature list that is only partially connected.

---

## Important Principles

1. **Evidence before claims:** Show what supports a skill and how strong that evidence is.
2. **Explainable decisions:** Display the reasons behind a match and the gaps that remain.
3. **Privacy by default:** Do not expose student data or evidence without authorization.
4. **Human review for ambiguity:** Flag uncertain or conflicting claims rather than making unsupported accusations.
5. **Safe code execution:** Never execute untrusted submissions directly in the Express application process.
6. **Responsible AI:** Treat generated content as a draft requiring validation, not as verified fact.
7. **No fabricated metrics:** Resume bullets must not invent impact numbers, responsibilities, or achievements.

---

## Contributing

Contributions from the team are welcome.

1. Check the current issues and team task assignments.
2. Create a feature branch.
3. Implement and test the change.
4. Update documentation or `.env.example` if setup changes.
5. Open a pull request and describe what changed, how it was tested, and any known limitations.

---

## License

No license has been specified yet. Add a `LICENSE` file before distributing the project publicly, and choose a license appropriate for your team's requirements.
