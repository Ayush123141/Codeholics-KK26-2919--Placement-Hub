-- ============================================================================
-- ProofHire Migration: Recruiter Cancellation & Evidence Review Enhancements
-- Member 2: Extends application_stage and review audit trail
-- ============================================================================

-- 1. Extend application_stage enum with WITHDRAWN and CANCELLED if not present
DO $$ BEGIN
  ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'WITHDRAWN';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'CANCELLED';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add reviewer notes and decision timestamp to evidence_records
ALTER TABLE public.evidence_records
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3. Add cancellation metadata to application_events
ALTER TABLE public.application_events
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS actor_role TEXT;
