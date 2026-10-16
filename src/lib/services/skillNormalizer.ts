import { CANONICAL_SKILLS, CanonicalSkill } from './skillCatalogue';

export interface SkillMatch {
  skillId: string;
  canonicalName: string;
  sourceText: string;
}

export interface ParsedJobSkills {
  jobId?: string;
  requiredSkills: SkillMatch[];
  preferredSkills: SkillMatch[];
  unmatchedTokens: string[];
  needsOfficerReview: boolean;
}

export class SkillNormalizer {
  private aliasMap: Map<string, CanonicalSkill>;

  constructor() {
    this.aliasMap = new Map();
    this.buildAliasMap();
  }

  private buildAliasMap(): void {
    for (const skill of CANONICAL_SKILLS) {
      this.aliasMap.set(this.normalizeToken(skill.name), skill);
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

  public extractSkillsFromText(text: string): SkillMatch[] {
    const results: Map<string, SkillMatch> = new Map();
    const cleanText = text.replace(/[\r\n\t]/g, ' ');

    const aliasesSorted = Array.from(this.aliasMap.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [alias, skill] of aliasesSorted) {
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

    if (input.requiredList && input.requiredList.length > 0) {
      for (const item of input.requiredList) {
        const match = this.matchSkill(item);
        if (match) {
          requiredSkillsMap.set(match.skillId, match);
        } else {
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
