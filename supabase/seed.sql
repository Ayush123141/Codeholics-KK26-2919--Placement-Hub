-- ============================================================================
-- ProofHire Seed Script
-- Member 2: Standard skills catalogue, organizations, demo jobs and sources
-- ============================================================================

-- 1. Insert Initial Canonical Skills
INSERT INTO public.skills (canonical_name, category, aliases)
VALUES
  ('React', 'Frontend', ARRAY['React.js', 'ReactJS', 'React Native']),
  ('TypeScript', 'Languages', ARRAY['TS']),
  ('JavaScript', 'Languages', ARRAY['JS', 'ECMAScript', 'ES6']),
  ('Node.js', 'Backend', ARRAY['Node', 'NodeJS']),
  ('PostgreSQL', 'Databases', ARRAY['Postgres', 'Postgre', 'pg']),
  ('Python', 'Languages', ARRAY['Py', 'Python3']),
  ('Tailwind CSS', 'Frontend', ARRAY['Tailwind', 'TailwindCSS']),
  ('Git', 'DevOps', ARRAY['GitHub', 'GitLab', 'Version Control']),
  ('Docker', 'DevOps', ARRAY['Containerization', 'Containers']),
  ('REST API', 'Backend', ARRAY['RESTful', 'RESTful API', 'Web APIs'])
ON CONFLICT (canonical_name) DO NOTHING;

-- 2. Insert Demo Organizations
INSERT INTO public.organizations (id, name, slug, type, website)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'TechSummit Institute', 'techsummit-institute', 'INSTITUTE', 'https://techsummittrainers.com'),
  ('b0000000-0000-0000-0000-000000000001', 'CloudScale Technologies', 'cloudscale-tech', 'COMPANY', 'https://cloudscale.example.com'),
  ('b0000000-0000-0000-0000-000000000002', 'FinFlow Digital', 'finflow-digital', 'COMPANY', 'https://finflow.example.com')
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Demo Jobs
INSERT INTO public.jobs (id, company_id, title, company_name, location, workplace_type, employment_type, description, salary_range)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Full Stack Engineer (React / Node.js)',
    'CloudScale Technologies',
    'Bengaluru, Karnataka (Hybrid)',
    'Hybrid',
    'Full-time',
    'We are hiring an enthusiastic Full Stack Engineer to build high-scale SaaS products. Must demonstrate solid proficiency in React and Node.js with SQL experience.',
    '₹8,00,000 - ₹12,00,000'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'Junior Frontend Developer',
    'FinFlow Digital',
    'Remote',
    'Remote',
    'Full-time',
    'Looking for a frontend engineer passionate about building sleek user interfaces with React and Tailwind CSS.',
    '₹6,00,000 - ₹9,00,000'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Map Required & Preferred Skills for Demo Job 1
-- Required: React, Node.js; Preferred: PostgreSQL, TypeScript
INSERT INTO public.job_skills (job_id, skill_id, is_required, min_proficiency, raw_source_text)
SELECT 'c0000000-0000-0000-0000-000000000001', id, true, 3, 'React.js'
FROM public.skills WHERE canonical_name = 'React'
ON CONFLICT DO NOTHING;

INSERT INTO public.job_skills (job_id, skill_id, is_required, min_proficiency, raw_source_text)
SELECT 'c0000000-0000-0000-0000-000000000001', id, true, 3, 'NodeJS'
FROM public.skills WHERE canonical_name = 'Node.js'
ON CONFLICT DO NOTHING;

INSERT INTO public.job_skills (job_id, skill_id, is_required, min_proficiency, raw_source_text)
SELECT 'c0000000-0000-0000-0000-000000000001', id, false, 3, 'Postgres'
FROM public.skills WHERE canonical_name = 'PostgreSQL'
ON CONFLICT DO NOTHING;

INSERT INTO public.job_skills (job_id, skill_id, is_required, min_proficiency, raw_source_text)
SELECT 'c0000000-0000-0000-0000-000000000001', id, false, 3, 'TypeScript'
FROM public.skills WHERE canonical_name = 'TypeScript'
ON CONFLICT DO NOTHING;

-- 5. Insert Job Source records (Demonstrating Company posting + Alumni referral)
INSERT INTO public.job_sources (job_id, source_type, source_url, raw_payload, duplicate_status)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'COMPANY_POSTING',
    'https://cloudscale.example.com/careers/fullstack-eng',
    '{"submitted_by": "recruiter@cloudscale.com", "channel": "portal"}'::jsonb,
    'UNIQUE'
  ),
  (
    'c0000000-0000-0000-0000-000000000001',
    'ALUMNI_REFERRAL',
    'https://linkedin.com/jobs/view/9981292',
    '{"referrer": "Rahul Sharma (Batch 2024)", "relationship": "Software Engineer II"}'::jsonb,
    'POSSIBLE_DUPLICATE'
  )
ON CONFLICT DO NOTHING;

-- 6. Insert Placement Campaign
INSERT INTO public.campaigns (id, institute_id, job_id, title, target_cohort_year)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'CloudScale 2026 Batch Placement Drive',
    2026
  )
ON CONFLICT (id) DO NOTHING;
