import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ExternalLink, 
  ArrowUpDown, 
  Briefcase, 
  FileCheck2,
  RefreshCw,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { useToast } from '@/components/ui/Toast';
import { placementApi } from '@/lib/api/placementApi';
import { MatchingResult } from '@/types';

export const BatchRankingShortlist: React.FC = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<MatchingResult[]>([]);
  const [policyVersion, setPolicyVersion] = useState('v1.0-deterministic-80-20');
  const [selectedJobId, setSelectedJobId] = useState('job-demo-001');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchingResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRanking = async (jobId: string) => {
    setIsLoading(true);
    try {
      const res = await placementApi.runBatchRanking(jobId);
      setCandidates(res.results);
      setPolicyVersion(res.policyVersion);
    } catch {
      showToast('Failed to load batch ranking results', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(selectedJobId);
  }, [selectedJobId]);

  const handleToggleShortlist = async (studentId: string) => {
    setActionLoading(studentId);
    try {
      const isShortlisted = await placementApi.toggleCandidateShortlist(studentId);
      setCandidates((prev) =>
        prev.map((c) =>
          c.studentId === studentId ? { ...c, isShortlisted } : c
        )
      );
      showToast(
        isShortlisted
          ? 'Candidate approved and shared with company recruiter shortlist!'
          : 'Candidate removed from recruiter shortlist',
        'info'
      );
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

  return (
    <div className="space-y-6">
      {/* Header */}
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

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRanking(selectedJobId)}
            className="gap-1.5 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run Ranking</span>
          </Button>
        </div>
      </div>

      {/* Target Job & Policy Selector */}
      <Card className="p-4 bg-slate-900 text-white border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-300">
              Active Job Description & Evaluation Policy
            </span>
            <h3 className="text-base font-bold text-white">
              CloudScale Technologies — Frontend Platform Engineer
            </h3>
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
                <th className="p-4 text-right">Recruiter Shortlist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((cand, idx) => (
                <tr
                  key={cand.studentId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    cand.isShortlisted ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <td className="p-4 text-center">
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
                      onClick={() => handleToggleShortlist(cand.studentId)}
                      isLoading={actionLoading === cand.studentId}
                      className="gap-1 font-bold whitespace-nowrap"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{cand.isShortlisted ? 'Approved for Recruiter' : 'Approve Shortlist'}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
                <p className="font-bold">Controlled Evidence Sharing:</p>
                <p className="text-[11px] text-slate-400">
                  Approving shares only job-relevant assessment scores and evaluated code. Private student documents remain protected.
                </p>
              </div>
              <Button
                size="sm"
                variant={selectedCandidate.isShortlisted ? 'success' : 'primary'}
                onClick={() => {
                  handleToggleShortlist(selectedCandidate.studentId);
                  setIsDetailOpen(false);
                }}
              >
                {selectedCandidate.isShortlisted ? 'In Shortlist' : 'Approve to Shortlist'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
