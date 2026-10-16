import { CANONICAL_SKILLS } from '../modules/skills/skillCatalogue';
import { CanonicalSkill, ParsedJobSkills, SkillMatch } from '../types';

export class SkillNormalizer {
  private aliasMap: Map<string, CanonicalSkill>;

  constructor() {
    this.aliasMap = new Map();
    this.buildAliasMap();
  }

  private buildAliasMap(): void {
    for (const skill of CANONICAL_SKILLS) {
      // Map primary name
      this.aliasMap.set(this.normalizeToken(skill.name), skill);
      // Map aliases
      for (const alias of skill.aliases) {
        this.aliasMap.set(this.normalizeToken(alias), skill);
      }
    }
  }

  public normalizeToken(token: string): string {
    return token
      .toLowerCase()
      .trim()
      .replace(/[^\w\s.+#-]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Safe token-aware skill lookup against the canonical catalog
   */
  public matchSkill(token: string): SkillMatch | null {
    const normalized = this.normalizeToken(token);
    if (!normalized) return null;

    const matched = this.aliasMap.get(normalized);
    if (matched) {
      return {
        skillId: matched.id,
        canonicalName: matched.name,
        sourceText: token.trim(),
      };
    }
    return null;
  }

  /**
   * Extract skills from unstructured text using token-aware matching & boundaries
   */
  public extractSkillsFromText(text: string): SkillMatch[] {
    const results: Map<string, SkillMatch> = new Map();
    const cleanText = text.replace(/[\r\n\t]/g, ' ');

    // Sort aliases by length descending to match multi-word phrases first (e.g. "REST API" before "REST")
    const aliasesSorted = Array.from(this.aliasMap.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [alias, skill] of aliasesSorted) {
      // Use boundary checking that accounts for programming terms (.js, c++, c#, etc.)
      const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');

      if (regex.test(cleanText)) {
        if (!results.has(skill.id)) {
          results.set(skill.id, {
            skillId: skill.id,
            canonicalName: skill.name,
            sourceText: alias,
          });
        }
      }
    }

    return Array.from(results.values());
  }

  /**
   * Parse structured JD requirements or extract from text sections
   */
  public parseJobSkills(
    input: {
      jobId?: string;
      requiredText?: string;
      preferredText?: string;
      requiredList?: string[];
      preferredList?: string[];
    }
  ): ParsedJobSkills {
    const requiredSkillsMap = new Map<string, SkillMatch>();
    const preferredSkillsMap = new Map<string, SkillMatch>();
    const unmatchedTokens: string[] = [];

    // Parse required items
    if (input.requiredList && input.requiredList.length > 0) {
      for (const item of input.requiredList) {
        const match = this.matchSkill(item);
        if (match) {
          requiredSkillsMap.set(match.skillId, match);
        } else {
          // Fallback to text extraction
          const extracted = this.extractSkillsFromText(item);
          if (extracted.length > 0) {
            extracted.forEach((m) => requiredSkillsMap.set(m.skillId, m));
          } else {
            unmatchedTokens.push(item);
          }
        }
      }
    } else if (input.requiredText) {
      const extracted = this.extractSkillsFromText(input.requiredText);
      extracted.forEach((m) => requiredSkillsMap.set(m.skillId, m));
    }

    // Parse preferred items
    if (input.preferredList && input.preferredList.length > 0) {
      for (const item of input.preferredList) {
        const match = this.matchSkill(item);
        if (match) {
          if (!requiredSkillsMap.has(match.skillId)) {
            preferredSkillsMap.set(match.skillId, match);
          }
        } else {
          const extracted = this.extractSkillsFromText(item);
          if (extracted.length > 0) {
            extracted.forEach((m) => {
              if (!requiredSkillsMap.has(m.skillId)) {
                preferredSkillsMap.set(m.skillId, m);
              }
            });
          } else {
            unmatchedTokens.push(item);
          }
        }
      }
    } else if (input.preferredText) {
      const extracted = this.extractSkillsFromText(input.preferredText);
      extracted.forEach((m) => {
        if (!requiredSkillsMap.has(m.skillId)) {
          preferredSkillsMap.set(m.skillId, m);
        }
      });
    }

    const requiredSkills = Array.from(requiredSkillsMap.values());
    const preferredSkills = Array.from(preferredSkillsMap.values());

    return {
      jobId: input.jobId,
      requiredSkills,
      preferredSkills,
      unmatchedTokens,
      needsOfficerReview: unmatchedTokens.length > 0 || requiredSkills.length === 0,
    };
  }
}

export const skillNormalizer = new SkillNormalizer();
