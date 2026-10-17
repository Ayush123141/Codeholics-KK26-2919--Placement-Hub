import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ExternalLink, 
  ArrowUpDown, 
  Briefcase, 
  FileCheck2,
  RefreshCw,
  Info,
  Send,
  Zap,
  Award,
  Filter,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { MotionFadeIn, MotionStagger, MotionStaggerItem } from '@/components/motion/MotionFadeIn';
import { useToast } from '@/components/ui/Toast';
import { placementApi } from '@/lib/api/placementApi';
import { MatchingResult, Campaign } from '@/types';

export const BatchRankingShortlist: React.FC = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<MatchingResult[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [policyVersion, setPolicyVersion] = useState('v1.0-deterministic-80-20');
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchingResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isShortlistReleased, setIsShortlistReleased] = useState(true);
  const [isAutoShortlisting, setIsAutoShortlisting] = useState(false);

  // Anti-bias warning modal state
  const [antiBiasCandidate, setAntiBiasCandidate] = useState<MatchingResult | null>(null);

  // Segmentation Filters
  const [filterDomain, setFilterDomain] = useState('ALL');
  const [filterSkill, setFilterSkill] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const camps = await placementApi.getCampaigns();
        setCampaigns(camps);
      } catch (err) {
        console.warn('Failed to load campaigns for batch ranking:', err);
      }
    }
    loadCampaigns();
  }, []);

  const fetchRanking = async (jobId: string) => {
    setIsLoading(true);
    try {
      const res = await placementApi.runBatchRanking(jobId === 'all' ? '' : jobId);
      setCandidates(res.results);
      setPolicyVersion(res.policyVersion);
    } catch {
      showToast('Failed to load batch ranking results', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseShortlist = async () => {
    const shortlistedCount = candidates.filter((c) => c.isShortlisted).length;
    if (shortlistedCount === 0) {
      showToast('Please approve at least one candidate before releasing shortlist to company.', 'warning');
      return;
    }

    setIsReleasing(true);
    try {
      const res = await placementApi.releaseShortlist(selectedJobId, 'Approved batch for corporate partner drive');
      setIsShortlistReleased(true);
      showToast(
        `Shortlist Released! ${res.releasedCount} candidate profile(s) now accessible to company recruiters.`,
        'success'
      );
    } catch {
      showToast('Failed to release shortlist to company', 'error');
    } finally {
      setIsReleasing(false);
    }
  };

  const handleAutoShortlist = async () => {
    setIsAutoShortlisting(true);
    try {
      const res = await placementApi.autoShortlistVerifiedCandidates(
        selectedJobId === 'all' ? '' : selectedJobId,
        60
      );
      showToast(
        `Automated Rule Applied! ${res.shortlistedCount} candidate(s) with verified skills & assessment passed auto-shortlisted. ${res.skippedCount} skipped due to unverified evidence or pending tests.`,
        'success'
      );
      await fetchRanking(selectedJobId);
      // Reload campaigns to refresh counts
      const camps = await placementApi.getCampaigns();
      setCampaigns(camps);
    } catch {
      showToast('Failed to run automated shortlisting', 'error');
    } finally {
      setIsAutoShortlisting(false);
    }
  };

  useEffect(() => {
    fetchRanking(selectedJobId);
  }, [selectedJobId]);

  const handleToggleShortlist = async (cand: MatchingResult) => {
    // ANTI-BIAS GUARD: If officer is trying to shortlist someone with 0 verified skills and 0 assessment score
    if (!cand.isShortlisted && cand.matchedSkills.length === 0 && cand.assessmentScore === 0) {
      setAntiBiasCandidate(cand);
      return;
    }

    const targetId = cand.applicationId || cand.id || cand.studentId;
    setActionLoading(targetId);

    try {
      const isShortlisted = await placementApi.toggleCandidateShortlist(targetId, cand.jobId);
      setCandidates((prev) =>
        prev.map((c) => {
          const isMatch =
            (cand.applicationId && c.applicationId === cand.applicationId) ||
            (cand.id && c.id === cand.id) ||
            (c.studentId === cand.studentId && (!cand.jobId || !c.jobId || c.jobId === cand.jobId));
          return isMatch ? { ...c, isShortlisted } : c;
        })
      );
      showToast(
        isShortlisted
          ? `${cand.studentName} approved! Added to verified shortlist.`
          : `${cand.studentName} removed from shortlist`,
        isShortlisted ? 'success' : 'info'
      );

      // Refresh campaigns count in background
      placementApi.getCampaigns().then(setCampaigns).catch(() => {});
    } catch {
      showToast('Failed to update shortlist status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDetail = (cand: MatchingResult) => {
    setSelectedCandidate(cand);
    setIsDetailOpen(true);
  };

  // Filter candidates according to domain, skill, and status
  const filteredCandidates = candidates.filter((c) => {
    if (filterDomain !== 'ALL') {
      const d = filterDomain.toLowerCase();
      const inSkills = [...c.matchedSkills, ...c.partialEvidenceSkills].some((s) => s.toLowerCase().includes(d));
      const inDept = c.department.toLowerCase().includes(d);
      if (!inSkills && !inDept) return false;
    }

    if (filterSkill !== 'ALL') {
      const sk = filterSkill.toLowerCase();
      const hasSkill = [...c.matchedSkills, ...c.partialEvidenceSkills].some((s) => s.toLowerCase() === sk);
      if (!hasSkill) return false;
    }

    if (filterStatus === 'SHORTLISTED' && !c.isShortlisted) return false;
    if (filterStatus === 'READY' && (c.fitScore < 65 || c.matchedSkills.length === 0)) return false;
    if (filterStatus === 'AVAILABLE' && c.hasOfferSecured) return false;
    if (filterStatus === 'OFFER_SECURED' && !c.hasOfferSecured) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <MotionFadeIn direction="down" duration={0.4}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Deterministic Batch Ranking & Shortlist Review
              </h1>
              <Badge variant="purple" size="md">
                PS6 Core Demonstration
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evaluate entire cohorts against normalized job requirements using transparent, reproducible rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRanking(selectedJobId)}
              className="gap-1.5 font-semibold text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Ranking</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoShortlist}
              isLoading={isAutoShortlisting}
              className="gap-1.5 font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-sm"
              title="Automatically shortlist verified candidates with score >= 60%"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Auto-Shortlist Verified</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleReleaseShortlist}
              isLoading={isReleasing}
              className="gap-1.5 font-bold shadow-sm text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Approve & Release Shortlist</span>
            </Button>
          </div>
        </div>
      </MotionFadeIn>

      {/* Target Job & Policy Selector */}
      <Card className="p-4 bg-slate-900 text-white border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-300">
                Active Hiring Drive & Evaluation Policy
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-md"
              >
                <option value="all">All Placement Drives & Applicant Students</option>
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.jobId}>
                    {camp.title} ({camp.companyName} — {camp.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-300">
              Required: <strong>React (45%), TypeScript (35%)</strong> • Preferred:{' '}
              <strong>Node.js (10%), PostgreSQL (10%)</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Scoring Policy</span>
              <span className="font-mono text-brand-300 font-bold">{policyVersion}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Shortlisted Candidates</span>
              <span className="text-emerald-400 font-bold text-sm">
                {candidates.filter((c) => c.isShortlisted).length} / {candidates.length} Approved
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Transparent Policy Explainer Callout */}
      <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Deterministic Scoring Guarantee:</strong> Required skills contribute up to 80% of total score; preferred skills contribute 20%. Each score links strictly to proctored assessments, rubric-evaluated projects, and verified GitHub commits. AI models never invent or hallucinate candidate scores.
        </p>
      </div>

      {/* Role, Skill & Status Segmentation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">Segmentation:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Domains</option>
            <option value="React">Frontend Platform</option>
            <option value="Node">Full Stack & Backend</option>
            <option value="Cloud">Cloud & DevOps</option>
            <option value="Python">AI / ML Infrastructure</option>
          </select>

          {/* Skill Filter */}
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Verified Skills</option>
            <option value="React">React</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Node.js">Node.js</option>
            <option value="Python">Python</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="Docker">Docker</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Candidates ({candidates.length})</option>
            <option value="SHORTLISTED">Shortlisted Only ({candidates.filter((c) => c.isShortlisted).length})</option>
            <option value="READY">Ready for Shortlist (Score ≥ 65%)</option>
            <option value="AVAILABLE">Available / Unplaced</option>
            <option value="OFFER_SECURED">Offer Secured (Equal Opp.)</option>
          </select>
        </div>
      </div>

      {/* Batch Ranking Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-12 text-center">Rank</th>
                <th className="p-4">Candidate & Cohort</th>
                <th className="p-4 w-44">Deterministic Fit</th>
                <th className="p-4">Matched Skills (Verified)</th>
                <th className="p-4">Evidence Gaps</th>
                <th className="p-4">Explanation & Rationale</th>
                <th className="p-4 text-right">Shortlist Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No candidates found for selected filter criteria</p>
                    <p className="text-[11px] mt-1">Try switching domain or skill filters to display applicant records.</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand, idx) => (
                  <tr
                    key={cand.studentId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      cand.isShortlisted ? 'bg-emerald-50/20' : ''
                    } ${cand.hasOfferSecured ? 'bg-slate-50/40 opacity-90' : ''}`}
                  >
                    <td className="p-4 text-center">
                      {cand.hasOfferSecured ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200" title="Candidate already secured an offer; deprioritized in queue for unplaced peers">
                          Placed
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={cand.studentName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{cand.studentName}</p>
                          <p className="text-[10px] text-slate-500">
                            {cand.department} • CGPA {cand.cgpa}
                          </p>
                          {cand.hasOfferSecured && (
                            <div className="mt-1">
                              <Badge variant="purple" size="sm" className="text-[10px] bg-purple-100 text-purple-900 border-purple-200">
                                🎓 Placed (Equal Opp. Queue)
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{cand.fitScore}% Fit</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Benchmark: {cand.assessmentScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              cand.fitScore >= 80
                                ? 'bg-emerald-500'
                                : cand.fitScore >= 60
                                ? 'bg-brand-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${cand.fitScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cand.matchedSkills.map((sk) => (
                          <Badge key={sk} variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-0.5" />
                            {sk}
                          </Badge>
                        ))}
                        {cand.partialEvidenceSkills.map((sk) => (
                          <Badge key={sk} variant="warning" size="sm">
                            <AlertCircle className="w-3 h-3 text-amber-600 mr-0.5" />
                            {sk} (Review Pending)
                          </Badge>
                        ))}
                        {cand.matchedSkills.length === 0 && cand.partialEvidenceSkills.length === 0 && (
                          <span className="text-[11px] text-slate-400 italic">No verified skills yet</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cand.noEvidenceSkills.map((sk) => (
                          <Badge key={sk} variant="default" size="sm">
                            {sk}
                          </Badge>
                        ))}
                        {cand.noEvidenceSkills.length === 0 && (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            None (All verified)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div
                        onClick={() => handleOpenDetail(cand)}
                        className="cursor-pointer group max-w-xs"
                      >
                        <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed group-hover:text-brand-600 transition-colors">
                          {cand.explanation}
                        </p>
                        <span className="text-[10px] text-brand-600 font-bold inline-block mt-0.5 group-hover:underline">
                          Inspect Evidence Trail →
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant={cand.isShortlisted ? 'success' : 'outline'}
                        onClick={() => handleToggleShortlist(cand)}
                        isLoading={actionLoading === (cand.applicationId || cand.id || cand.studentId)}
                        className="gap-1 font-bold whitespace-nowrap text-xs"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{cand.isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Anti-Bias Policy Restriction Modal */}
      {antiBiasCandidate && (
        <Modal
          isOpen={!!antiBiasCandidate}
          onClose={() => setAntiBiasCandidate(null)}
          title="Anti-Bias Guardrail: Action Blocked"
          description="Institutional Fairness & Evidence-Based Verification Standard"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  Cannot shortlist {antiBiasCandidate.studentName} without verified evidence
                </p>
                <p className="leading-relaxed">
                  The placement policy mandates that candidate shortlisting must be backed by transparent, deterministic data:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-900/90 pt-1">
                  <li>Current verified skills: <strong>0 verified</strong></li>
                  <li>Assessment benchmark: <strong>Not yet completed (0%)</strong></li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Why was this action prevented?</p>
              <p>
                To eliminate subjective recruiter bias and unfair manual favors, only candidates who pass proctored skill assessments or verifiable repository code audits can be added to corporate partner shortlists.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() => setAntiBiasCandidate(null)}
                className="text-xs font-semibold"
              >
                Understood — Enforce Anti-Bias Policy
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Candidate Match Audit: ${selectedCandidate.studentName}`}
          description={`Computed Fit Score: ${selectedCandidate.fitScore}% • Evaluated under Policy ${policyVersion}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  Deterministic Score Breakdown: {selectedCandidate.fitScore}/100
                </span>
                <span className="font-mono text-slate-500 font-semibold">{policyVersion}</span>
              </div>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {selectedCandidate.explanation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-900">Verified Match Skills (Weight: 80%):</p>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.matchedSkills.map((s) => (
                    <Badge key={s} variant="success" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                <p className="font-bold text-amber-900">Missing / Unverified Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.noEvidenceSkills.map((s) => (
                    <Badge key={s} variant="default" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold">Verified Evidence Preservation:</p>
                <p className="text-[11px] text-slate-400">
                  Approved candidate records include proctored benchmarks and verified repository audits for audit compliance.
                </p>
              </div>
              <Button
                size="sm"
                variant={selectedCandidate.isShortlisted ? 'success' : 'primary'}
                onClick={() => {
                  handleToggleShortlist(selectedCandidate);
                  setIsDetailOpen(false);
                }}
              >
                {selectedCandidate.isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
