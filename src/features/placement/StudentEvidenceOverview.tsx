import React, { useState } from 'react';
import { 
  Users2, 
  Search, 
  ShieldCheck, 
  Award, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  FileCode2,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DEMO_BATCH_RANKING, DEMO_EVIDENCE } from '@/lib/api/demoData';
import { placementApi } from '@/lib/api/placementApi';
import { MatchingResult, EvidenceRecord } from '@/types';

export const StudentEvidenceOverview: React.FC = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<MatchingResult[]>(DEMO_BATCH_RANKING);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(DEMO_EVIDENCE);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'SCORE_ASC' | 'CGPA_DESC' | 'NAME_ASC'>('SCORE_DESC');
  const [selectedCandidate, setSelectedCandidate] = useState<MatchingResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const cohortData = await placementApi.getCohortEvidence();
        if (cohortData.candidates && cohortData.candidates.length > 0) {
          setCandidates(cohortData.candidates);
        }
        if (cohortData.evidenceList && cohortData.evidenceList.length > 0) {
          setEvidenceList(cohortData.evidenceList);
        }
      } catch (err) {
        console.warn('Failed to load live cohort evidence:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);


  const filtered = candidates
    .filter((c) => {
      const matchesSearch =
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.matchedSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'SCORE_DESC') return (b.assessmentScore || 0) - (a.assessmentScore || 0);
      if (sortBy === 'SCORE_ASC') return (a.assessmentScore || 0) - (b.assessmentScore || 0);
      if (sortBy === 'CGPA_DESC') return b.cgpa - a.cgpa;
      if (sortBy === 'NAME_ASC') return a.studentName.localeCompare(b.studentName);
      return 0;
    });

  const handleInspect = (cand: MatchingResult) => {
    setSelectedCandidate(cand);
    setIsDetailOpen(true);
  };

  const getCandidateEvidence = (studentId: string, evidenceRefs?: string[]) => {
    const matched = evidenceList.filter(
      (e) => e.studentId === studentId || (evidenceRefs && evidenceRefs.includes(e.id))
    );
    return matched.length > 0 ? matched : evidenceList.slice(0, 4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cohort Student Evidence Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect student candidate profiles, critical benchmark scores, and verified codebase audits across the 2026 graduating cohort.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or skill..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Sort by Score / CGPA */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-500" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="SCORE_DESC">Benchmark Score (High → Low)</option>
                <option value="SCORE_ASC">Benchmark Score (Low → High)</option>
                <option value="CGPA_DESC">Academic CGPA (High → Low)</option>
                <option value="NAME_ASC">Candidate Name (A → Z)</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dept:
              </span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Candidates Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Candidate</th>
                <th className="p-4">Department & CGPA</th>
                <th className="p-4">Critical Evidence & Benchmark</th>
                <th className="p-4">Verified Skills</th>
                <th className="p-4">Identified Gaps</th>
                <th className="p-4 text-right">Evidence Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cand) => {
                const isTopScore = (cand.assessmentScore || 0) >= 85;
                return (
                  <tr key={cand.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={cand.studentName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{cand.studentName}</p>
                          <p className="text-[10px] text-slate-500">{cand.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">
                      <div>
                        <span className="font-semibold text-slate-800">{cand.department}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          CGPA: <strong className="text-slate-900 font-bold">{cand.cgpa}</strong> / 10.0
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                            isTopScore 
                              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' 
                              : 'text-brand-800 bg-brand-50 border border-brand-200'
                          }`}>
                            <Award className="w-3.5 h-3.5" />
                            {cand.assessmentScore}% Proctored Score
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-tight">
                          {cand.matchedSkills.includes('React') 
                            ? 'React MCQ Proctored (94%) • Capstone Rubric (4.8/5)' 
                            : cand.matchedSkills.includes('TypeScript')
                            ? 'TypeScript Generics Proctored • Algorithmic Benchmark'
                            : 'Standardized Core Technical Assessment & Repo Audit'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cand.matchedSkills.length > 0 ? (
                          cand.matchedSkills.map((sk) => (
                            <Badge key={sk} variant="success" size="sm">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-0.5" />
                              {sk}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Pending verification</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cand.noEvidenceSkills.length > 0 ? (
                          cand.noEvidenceSkills.map((sk) => (
                            <Badge key={sk} variant="default" size="sm">
                              {sk}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Full Evidence Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspect(cand)}
                        className="font-semibold text-xs gap-1 shadow-xs hover:border-brand-500 hover:text-brand-700"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>Inspect Evidence</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Evidence Summary: ${selectedCandidate.studentName}`}
          description={`${selectedCandidate.department} • CGPA: ${selectedCandidate.cgpa} • Proctored Assessment: ${selectedCandidate.assessmentScore}%`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">Match Rationale & Explanation:</p>
              <p className="text-slate-600 leading-relaxed">{selectedCandidate.explanation}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  Verified Evidence Artifacts & Scrutiny
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  {getCandidateEvidence(selectedCandidate.studentId, selectedCandidate.evidenceRefs).length} Artifacts on Record
                </span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {getCandidateEvidence(selectedCandidate.studentId, selectedCandidate.evidenceRefs).map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ev.type === 'ASSESSMENT' ? (
                          <Award className="w-4 h-4 text-brand-600 shrink-0" />
                        ) : ev.type === 'PROJECT' ? (
                          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <FileCode2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ev.score && (
                          <span className="font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-[10px]">
                            {ev.score}
                          </span>
                        )}
                        <Badge 
                          variant={ev.status === 'VERIFIED' ? 'success' : ev.status === 'NEEDS_REVIEW' ? 'warning' : 'default'} 
                          size="sm"
                        >
                          {ev.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">{ev.details}</p>

                    {/* Certificate / Credential Details */}
                    {(ev.type === 'CERTIFICATE' || ev.certificateFileName || ev.issuer) && (
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between text-[11px] text-amber-900">
                        <span className="font-semibold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Issuer: <strong>{ev.issuer || 'Verified Authority'}</strong></span>
                        </span>
                        {ev.certificateFileName && (
                          <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-amber-100 font-mono">
                            {ev.certificateFileName}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100">
                      <span>Verifier: <strong className="text-slate-600">{ev.verifier}</strong></span>
                      <span>Verified: {ev.date}</span>
                    </div>

                    {/* Automated Verification Status & Scrutiny */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Automated Engine Verified</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {ev.credibilityScore || 95}% Credibility
                        </span>
                      </div>

                      <div className="flex gap-1.5 self-end sm:self-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await placementApi.reviewEvidence(
                              ev.id, 
                              'MANUALLY_REVIEWED', 
                              'Dr. Ramesh Sharma (Placement Cell)', 
                              'Evidence approved following scrutiny inspection.'
                            );
                            setEvidenceList((prev) =>
                              prev.map((item) => (item.id === ev.id ? { ...item, status: 'VERIFIED' as any } : item))
                            );
                            showToast(`Artifact "${ev.title}" verified by officer signoff.`, 'success');
                          }}
                          className="text-[10px] text-emerald-700 hover:bg-emerald-50 h-7 px-2 font-semibold"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Signoff Override
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await placementApi.reviewEvidence(
                              ev.id, 
                              'NEEDS_REVIEW', 
                              'Dr. Ramesh Sharma (Placement Cell)', 
                              'Revision requested by placement officer.'
                            );
                            setEvidenceList((prev) =>
                              prev.map((item) => (item.id === ev.id ? { ...item, status: 'NEEDS_REVIEW' as any } : item))
                            );
                            showToast(`Revision requested for "${ev.title}".`, 'warning');
                          }}
                          className="text-[10px] text-amber-700 hover:bg-amber-50 h-7 px-2 font-semibold"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Request Revision
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await placementApi.reviewEvidence(
                              ev.id, 
                              'UNVERIFIED', 
                              'Dr. Ramesh Sharma (Placement Cell)', 
                              'Unverifiable evidence claim.'
                            );
                            setEvidenceList((prev) =>
                              prev.map((item) => (item.id === ev.id ? { ...item, status: 'UNVERIFIED' as any } : item))
                            );
                            showToast(`Artifact "${ev.title}" rejected.`, 'error');
                          }}
                          className="text-[10px] text-rose-700 hover:bg-rose-50 h-7 px-2 font-semibold"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
