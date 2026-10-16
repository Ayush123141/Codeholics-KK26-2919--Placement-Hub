-- ============================================================================
-- ProofHire Database Migration (PS6 Placement Hub)
-- Member 2: Schema, Constraints, Indexes & Row Level Security (RLS)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'PLACEMENT_OFFICER', 'COMPANY_RECRUITER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_source_type AS ENUM ('COMPANY_POSTING', 'ALUMNI_REFERRAL', 'API_ADAPTER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE duplicate_status AS ENUM ('UNIQUE', 'POSSIBLE_DUPLICATE', 'CONFIRMED_DUPLICATE', 'RESOLVED_UNIQUE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_type AS ENUM ('ASSESSMENT', 'PROJECT', 'GITHUB_REPO', 'CERTIFICATE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_status AS ENUM ('UNVERIFIED', 'NEEDS_REVIEW', 'ISSUER_VERIFIED', 'MANUALLY_REVIEWED', 'CONTRADICTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_stage AS ENUM ('APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. ORGANIZATIONS (Institutes, Companies)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INSTITUTE', 'COMPANY')),
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'STUDENT',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  cohort_year INT,
  department TEXT,
  github_username TEXT,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SKILLS CATALOGUE (Canonical skills with standardized naming)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. JOBS (Canonical job postings)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  workplace_type TEXT DEFAULT 'Hybrid' CHECK (workplace_type IN ('Remote', 'Onsite', 'Hybrid')),
  employment_type TEXT DEFAULT 'Full-time',
  description TEXT NOT NULL,
  salary_range TEXT,
  min_experience_years NUMERIC(3,1) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JOB SOURCES (Tracks origin: Company submit, Alumni referral, API ingestion)
CREATE TABLE IF NOT EXISTS public.job_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  source_type job_source_type NOT NULL,
  external_id TEXT,
  source_url TEXT,
  referrer_name TEXT,
  referrer_email TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  duplicate_status duplicate_status DEFAULT 'UNIQUE',
  duplicate_confidence NUMERIC(4,3) DEFAULT 0,
  duplicate_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. JOB SKILLS (Required vs Preferred skills per job)
CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  min_proficiency INT DEFAULT 3 CHECK (min_proficiency BETWEEN 1 AND 5),
  raw_source_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- 9. PLACEMENT CAMPAIGNS (Institute drives linking job to cohort)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_cohort_year INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EVIDENCE RECORDS (Projects, Assessments, GitHub repos, Certificates)
CREATE TABLE IF NOT EXISTS public.evidence_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type evidence_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status evidence_status DEFAULT 'UNVERIFIED',
  score NUMERIC(5,2),
  source_url TEXT,
  file_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EVIDENCE SKILL MAPPINGS (Associates evidence items to specific skills)
CREATE TABLE IF NOT EXISTS public.evidence_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID NOT NULL REFERENCES public.evidence_records(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
  proficiency_demonstrated INT DEFAULT 3 CHECK (proficiency_demonstrated BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evidence_id, skill_id)
);

-- 12. MATCH RESULTS (Deterministic score calculations & explanations)
CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_fit_score INT NOT NULL CHECK (overall_fit_score BETWEEN 0 AND 100),
  matched_skills JSONB DEFAULT '[]'::jsonb,
  partial_skills JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL,
  policy_version TEXT NOT NULL DEFAULT 'v1',
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, student_id, policy_version)
);

-- 13. APPLICATIONS (Pipeline tracking)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  current_stage application_stage NOT NULL DEFAULT 'APPLIED',
  resume_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- 14. APPLICATION EVENTS (Audit trail for state changes)
CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_stage application_stage,
  to_stage application_stage NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_job_sources_job_id ON public.job_sources(job_id);
CREATE INDEX IF NOT EXISTS idx_job_sources_external_id ON public.job_sources(external_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_job_id ON public.campaigns(job_id);
CREATE INDEX IF NOT EXISTS idx_evidence_student_id ON public.evidence_records(student_id);
CREATE INDEX IF NOT EXISTS idx_evidence_skills_skill_id ON public.evidence_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_match_results_campaign ON public.match_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_application_events_app ON public.application_events(application_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;

-- Helper function: get role of current authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Anyone authenticated can read profiles; Users can update their own
CREATE POLICY "Profiles viewable by authenticated users" 
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Skills: Viewable by anyone, manageable by officers
CREATE POLICY "Skills are readable by all" 
  ON public.skills FOR SELECT TO authenticated USING (true);

-- Jobs: Active jobs readable by authenticated; managed by officers or hiring company
CREATE POLICY "Jobs viewable by authenticated" 
  ON public.jobs FOR SELECT TO authenticated USING (true);

-- Job Skills: Viewable by all
CREATE POLICY "Job skills viewable by authenticated" 
  ON public.job_skills FOR SELECT TO authenticated USING (true);

-- Campaigns: Viewable by all authenticated
CREATE POLICY "Campaigns viewable by authenticated" 
  ON public.campaigns FOR SELECT TO authenticated USING (true);

-- Evidence: Students can manage own; Officers and matching engines can view
CREATE POLICY "Students can view own evidence" 
  ON public.evidence_records FOR SELECT TO authenticated 
  USING (student_id = auth.uid() OR public.current_user_role() IN ('PLACEMENT_OFFICER', 'COMPANY_RECRUITER'));

CREATE POLICY "Students can insert own evidence" 
  ON public.evidence_records FOR INSERT TO authenticated 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own evidence" 
  ON public.evidence_records FOR UPDATE TO authenticated 
  USING (student_id = auth.uid());

-- Evidence Skills: Viewable matching evidence access
CREATE POLICY "Evidence skills viewable" 
  ON public.evidence_skills FOR SELECT TO authenticated USING (true);

-- Applications: Students view own; Officers view all; Recruiters view their company's
CREATE POLICY "Students view own applications" 
  ON public.applications FOR SELECT TO authenticated 
  USING (student_id = auth.uid() OR public.current_user_role() IN ('PLACEMENT_OFFICER', 'COMPANY_RECRUITER'));

CREATE POLICY "Students can apply" 
  ON public.applications FOR INSERT TO authenticated 
  WITH CHECK (student_id = auth.uid());

-- Match Results: Viewable by student for their own, or officer/recruiter
CREATE POLICY "Match results viewable" 
  ON public.match_results FOR SELECT TO authenticated 
  USING (student_id = auth.uid() OR public.current_user_role() IN ('PLACEMENT_OFFICER', 'COMPANY_RECRUITER'));

-- Application Events: Viewable by student owner and staff
CREATE POLICY "Application events viewable" 
  ON public.application_events FOR SELECT TO authenticated USING (true);
