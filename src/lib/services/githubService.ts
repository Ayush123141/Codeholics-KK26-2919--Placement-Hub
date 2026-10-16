import { skillNormalizer } from './skillNormalizer';

export interface GitHubRepoAnalysis {
  id: string;
  studentId: string;
  repoUrl: string;
  owner: string;
  repo: string;
  status: 'EVIDENCE_FOUND' | 'NEEDS_REVIEW' | 'ERROR';
  detectedSkills: {
    skillId: string;
    skillName: string;
    evidenceSource: 'manifest' | 'readme' | 'files';
    detail: string;
  }[];
  filesInspected: string[];
  findingsSummary: string;
  analyzedAt: string;
  rateLimitWarning?: boolean;
}

export class GitHubService {
  public parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    if (!url || typeof url !== 'string') return null;
    const clean = url.trim();
    const match = clean.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/i, ''),
    };
  }

  public async analyzePublicRepo(
    studentId: string,
    repoUrl: string,
    githubToken?: string
  ): Promise<GitHubRepoAnalysis> {
    const parsed = this.parseGitHubUrl(repoUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
    }

    const { owner, repo } = parsed;
    const detectedSkills: GitHubRepoAnalysis['detectedSkills'] = [];
    const filesInspected: string[] = [];
    let rateLimitWarning = false;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    try {
      // 1. Fetch repo metadata
      const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (repoResp.status === 403 || repoResp.status === 429) {
        rateLimitWarning = true;
      }

      if (repoResp.ok) {
        const repoData = (await repoResp.json()) as any;
        const mainLang = repoData.language;
        if (mainLang) {
          const match = skillNormalizer.matchSkill(mainLang);
          if (match) {
            detectedSkills.push({
              skillId: match.skillId,
              skillName: match.canonicalName,
              evidenceSource: 'manifest',
              detail: `Primary repository language identified as ${mainLang}`,
            });
          }
        }
      }

      // 2. Fetch root directory manifest
      const contentsResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`,
        { headers }
      );

      if (contentsResp.ok) {
        const contents = (await contentsResp.json()) as any[];
        if (Array.isArray(contents)) {
          const filenames = contents.map((c) => c.name);

          // Check package.json
          if (filenames.includes('package.json')) {
            filesInspected.push('package.json');
            const pkgFile = contents.find((c) => c.name === 'package.json');
            if (pkgFile && pkgFile.download_url) {
              const pkgResp = await fetch(pkgFile.download_url);
              if (pkgResp.ok) {
                const pkgJson = await pkgResp.json();
                const allDeps = {
                  ...(pkgJson.dependencies || {}),
                  ...(pkgJson.devDependencies || {}),
                };

                const depNames = Object.keys(allDeps);
                for (const dep of depNames) {
                  const match = skillNormalizer.matchSkill(dep);
                  if (match && !detectedSkills.some((d) => d.skillId === match.skillId)) {
                    detectedSkills.push({
                      skillId: match.skillId,
                      skillName: match.canonicalName,
                      evidenceSource: 'manifest',
                      detail: `Detected dependency ${dep} in package.json`,
                    });
                  }
                }
              }
            }
          }

          // Check requirements.txt
          if (filenames.includes('requirements.txt')) {
            filesInspected.push('requirements.txt');
            const pyFile = contents.find((c) => c.name === 'requirements.txt');
            if (pyFile && pyFile.download_url) {
              const pyResp = await fetch(pyFile.download_url);
              if (pyResp.ok) {
                const pyText = await pyResp.text();
                const lines = pyText.split('\n');
                for (const line of lines) {
                  const cleanLine = line.split(/[=<>~]/)[0].trim();
                  const match = skillNormalizer.matchSkill(cleanLine);
                  if (match && !detectedSkills.some((d) => d.skillId === match.skillId)) {
                    detectedSkills.push({
                      skillId: match.skillId,
                      skillName: match.canonicalName,
                      evidenceSource: 'manifest',
                      detail: `Detected requirement ${cleanLine} in requirements.txt`,
                    });
                  }
                }
              }
            }
          }

          // Check Dockerfile
          if (filenames.includes('Dockerfile') || filenames.includes('docker-compose.yml')) {
            filesInspected.push('Dockerfile');
            const dockerMatch = skillNormalizer.matchSkill('Docker');
            if (dockerMatch && !detectedSkills.some((d) => d.skillId === dockerMatch.skillId)) {
              detectedSkills.push({
                skillId: dockerMatch.skillId,
                skillName: dockerMatch.canonicalName,
                evidenceSource: 'manifest',
                detail: 'Detected Docker configuration files in repository root',
              });
            }
          }
        }
      }

      const status: GitHubRepoAnalysis['status'] =
        detectedSkills.length > 0 ? 'EVIDENCE_FOUND' : 'NEEDS_REVIEW';

      const findingsSummary =
        detectedSkills.length > 0
          ? `Discovered ${detectedSkills.length} verified skill evidence artifact(s) from manifests.`
          : 'Repository analyzed but no standard dependency manifests (package.json, Dockerfile, etc.) recognized. Flagged for officer review.';

      return {
        id: `gh-analysis-${Date.now()}`,
        studentId,
        repoUrl,
        owner,
        repo,
        status,
        detectedSkills,
        filesInspected,
        findingsSummary,
        analyzedAt: new Date().toISOString(),
        rateLimitWarning,
      };
    } catch {
      return {
        id: `gh-analysis-${Date.now()}`,
        studentId,
        repoUrl,
        owner,
        repo,
        status: 'NEEDS_REVIEW',
        detectedSkills: [],
        filesInspected,
        findingsSummary: 'Public repository inspection encountered rate limits or network timeout. Flagged for manual review.',
        analyzedAt: new Date().toISOString(),
        rateLimitWarning: true,
      };
    }
  }
}

export const githubService = new GitHubService();
