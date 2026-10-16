import { supabaseAdmin } from '../../supabase.js';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  status: 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'CONFIRMED_DUPLICATE';
  confidence: number;
  matchedJobId?: string;
  notes?: string;
}

/**
 * Checks incoming job against existing jobs for duplicates
 * Strategy:
 * 1. External ID / Canonical URL check (High confidence)
 * 2. Normalized Title + Company Name check
 */
export async function detectDuplicateJob(params: {
  title: string;
  companyName: string;
  sourceUrl?: string;
  externalId?: string;
}): Promise<DuplicateCheckResult> {
  const { title, companyName, sourceUrl, externalId } = params;

  // 1. Check by External ID if provided
  if (externalId) {
    const { data: matchedSource } = await supabaseAdmin
      .from('job_sources')
      .select('job_id')
      .eq('external_id', externalId)
      .limit(1)
      .maybeSingle();

    if (matchedSource?.job_id) {
      return {
        isDuplicate: true,
        status: 'CONFIRMED_DUPLICATE',
        confidence: 0.99,
        matchedJobId: matchedSource.job_id,
        notes: `Exact match found on external_id: ${externalId}`,
      };
    }
  }

  // 2. Check by Source URL if provided
  if (sourceUrl && sourceUrl.trim() !== '') {
    const { data: matchedUrl } = await supabaseAdmin
      .from('job_sources')
      .select('job_id')
      .eq('source_url', sourceUrl.trim())
      .limit(1)
      .maybeSingle();

    if (matchedUrl?.job_id) {
      return {
        isDuplicate: true,
        status: 'CONFIRMED_DUPLICATE',
        confidence: 0.95,
        matchedJobId: matchedUrl.job_id,
        notes: `Exact source URL match: ${sourceUrl}`,
      };
    }
  }

  // 3. Normalized Title + Company check
  const cleanTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanCompany = companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const { data: existingJobs } = await supabaseAdmin
    .from('jobs')
    .select('id, title, company_name');

  if (existingJobs && existingJobs.length > 0) {
    for (const job of existingJobs) {
      const existingCleanTitle = job.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const existingCleanCompany = job.company_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      if (existingCleanCompany === cleanCompany) {
        if (existingCleanTitle === cleanTitle) {
          return {
            isDuplicate: true,
            status: 'POSSIBLE_DUPLICATE',
            confidence: 0.85,
            matchedJobId: job.id,
            notes: `Identical company (${companyName}) and job title (${title}) detected. Officer review recommended.`,
          };
        } else if (
          existingCleanTitle.includes(cleanTitle) ||
          cleanTitle.includes(existingCleanTitle)
        ) {
          return {
            isDuplicate: true,
            status: 'POSSIBLE_DUPLICATE',
            confidence: 0.65,
            matchedJobId: job.id,
            notes: `Substantial title similarity detected under ${companyName}.`,
          };
        }
      }
    }
  }

  return {
    isDuplicate: false,
    status: 'UNIQUE',
    confidence: 0.0,
  };
}
