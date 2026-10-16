import { skillNormalizer } from './skillNormalizer';
import { ParsedJobSkills, SkillMatch } from '../types';

export interface LLMJobParsingResult {
  requiredSkills: string[];
  preferredSkills: string[];
}

export class LLMAssistService {
  private apiKey: string;
  private endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || '';
  }

  /**
   * Use OpenRouter LLM as an assistive parser for unstructured job descriptions.
   * As per Section 4.1 & 4.5:
   * "Use an LLM only as an assistive parser; validate returned skills against the catalogue and allow officer correction."
   */
  public async parseJobDescriptionWithLLM(
    jdText: string,
    jobId?: string
  ): Promise<ParsedJobSkills> {
    const key = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || this.apiKey;

    // Fallback directly to deterministic regex parser if key is absent or offline
    if (!key || key.startsWith('placeholder')) {
      return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
    }

    try {
      const prompt = `You are a technical recruiter assisting an evidence-based placement hub.
Analyze the following Job Description (JD) and extract the required and preferred technical skills.
Output ONLY valid JSON with this exact schema (no markdown, no backticks):
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill3"]
}

Job Description:
${jdText}`;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://proofhire.placementhub.local',
          'X-Title': 'ProofHire Placement Hub',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        // Fallback to deterministic normalizer on non-200
        return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      }

      const parsedJson: LLMJobParsingResult = JSON.parse(content);

      // CRITICAL: Validate every returned skill against canonical catalogue!
      const validatedReq: SkillMatch[] = [];
      const validatedPref: SkillMatch[] = [];
      const unmatchedTokens: string[] = [];

      for (const item of parsedJson.requiredSkills || []) {
        const match = skillNormalizer.matchSkill(item);
        if (match) {
          if (!validatedReq.some((m) => m.skillId === match.skillId)) {
            validatedReq.push(match);
          }
        } else {
          unmatchedTokens.push(item);
        }
      }

      for (const item of parsedJson.preferredSkills || []) {
        const match = skillNormalizer.matchSkill(item);
        if (match) {
          if (!validatedReq.some((m) => m.skillId === match.skillId) &&
              !validatedPref.some((m) => m.skillId === match.skillId)) {
            validatedPref.push(match);
          }
        } else {
          unmatchedTokens.push(item);
        }
      }

      // If LLM returned fewer skills than token parser, merge deterministic findings
      const deterministic = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      deterministic.requiredSkills.forEach((s) => {
        if (!validatedReq.some((m) => m.skillId === s.skillId)) {
          validatedReq.push(s);
        }
      });

      return {
        jobId: jobId || 'job-preview',
        requiredSkills: validatedReq,
        preferredSkills: validatedPref,
        unmatchedTokens,
        needsOfficerReview: unmatchedTokens.length > 0 || validatedReq.length === 0,
      };
    } catch {
      // In case of any network/API timeout, fall back cleanly without breaking the demo
      return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
    }
  }

  /**
   * Assistive claim extraction for candidate uploaded resume text.
   */
  public async extractResumeClaimsWithLLM(resumeText: string): Promise<string[]> {
    const key = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || this.apiKey;
    if (!key || key.startsWith('placeholder')) {
      return resumeText
        .split(/[\r\n]+|[•\-\*]\s+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 15);
    }

    try {
      const prompt = `Extract all factual technical and project claims from this resume text as a JSON array of strings.
Output ONLY a JSON array, e.g. ["claim 1", "claim 2"].
Resume text:
${resumeText}`;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://proofhire.placementhub.local',
          'X-Title': 'ProofHire Placement Hub',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        return resumeText
          .split(/[\r\n]+|[•\-\*]\s+/)
          .map((l) => l.trim())
          .filter((l) => l.length > 15);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch {
      return resumeText
        .split(/[\r\n]+|[•\-\*]\s+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 15);
    }
  }
}

export const llmAssistService = new LLMAssistService();
