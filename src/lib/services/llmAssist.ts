import { skillNormalizer, ParsedJobSkills } from './skillNormalizer';

export interface LLMJobParsingResult {
  requiredSkills: string[];
  preferredSkills: string[];
}

export interface EnrichedParsedJobSkills extends ParsedJobSkills {
  isLLM: boolean;
  rawResult?: LLMJobParsingResult;
}

export class LLMAssistService {
  private endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && !key.startsWith('placeholder'));
  }

  private getApiKey(): string {
    return (
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      ''
    );
  }

  public async parseJobDescriptionWithLLM(
    jdText: string,
    jobId?: string
  ): Promise<EnrichedParsedJobSkills> {
    const key = this.getApiKey();

    if (!key || key.startsWith('placeholder')) {
      const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      return { ...fallback, isLLM: false };
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

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': origin,
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
        const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
        return { ...fallback, isLLM: false };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
        return { ...fallback, isLLM: false };
      }

      const parsed: LLMJobParsingResult = JSON.parse(content);
      const normalized = skillNormalizer.parseJobSkills({
        jobId,
        requiredList: parsed.requiredSkills || [],
        preferredList: parsed.preferredSkills || [],
        requiredText: jdText,
      });

      return {
        ...normalized,
        isLLM: true,
        rawResult: parsed,
      };
    } catch {
      const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      return { ...fallback, isLLM: false };
    }
  }

  public async tailorResumeSummaryWithLLM(
    jobTitle: string,
    company: string,
    skills: string[],
    studentName: string = 'Alex Morgan'
  ): Promise<string> {
    const key = this.getApiKey();
    const skillsListStr = skills.length > 0 ? skills.join(', ') : 'modern software engineering principles';

    if (!key || key.startsWith('placeholder')) {
      return `Final-year Computer Science undergraduate with verified practical competencies in ${skillsListStr}. Seeking to contribute to ${company}'s ${jobTitle} initiatives with demonstrated software engineering benchmarks.`;
    }

    try {
      const prompt = `You are a professional technical career advisor for an evidence-based placement portal.
Write a concise, high-impact ATS professional summary (2 to 3 sentences maximum, under 65 words) for student "${studentName}".
Target Role: ${jobTitle} at ${company}.
Verified technical skills demonstrated in coursework and proctored projects: ${skillsListStr}.
Tone: Professional, confident, factual, and strictly focused on demonstrated competence.
Do not use hyperbolic fluff. Return ONLY the plain text summary, no quotes, no conversational filler.`;

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': origin,
          'X-Title': 'ProofHire Placement Hub',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter returned status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
      throw new Error('Empty response from model');
    } catch (err) {
      console.warn('Fallback to standard summary:', err);
      return `Final-year Computer Science undergraduate with verified practical competencies in ${skillsListStr}. Seeking to contribute to ${company}'s ${jobTitle} initiatives with demonstrated software engineering benchmarks.`;
    }
  }
}

export const llmAssistService = new LLMAssistService();

