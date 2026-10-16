import { skillNormalizer, ParsedJobSkills } from './skillNormalizer';

export interface LLMJobParsingResult {
  requiredSkills: string[];
  preferredSkills: string[];
}

export class LLMAssistService {
  private endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  private getApiKey(): string {
    return (
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      ''
    );
  }

  public async parseJobDescriptionWithLLM(
    jdText: string,
    jobId?: string
  ): Promise<ParsedJobSkills> {
    const key = this.getApiKey();

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
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
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
        return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      }

      const parsed: LLMJobParsingResult = JSON.parse(content);
      return skillNormalizer.parseJobSkills({
        jobId,
        requiredList: parsed.requiredSkills || [],
        preferredList: parsed.preferredSkills || [],
        requiredText: jdText,
      });
    } catch {
      return skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
    }
  }
}

export const llmAssistService = new LLMAssistService();
