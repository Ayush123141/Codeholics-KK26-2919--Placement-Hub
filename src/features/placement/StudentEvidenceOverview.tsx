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
  AlertCircle
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
  const [candidates] = useState<MatchingResult[]>(DEMO_BATCH_RANKING);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(DEMO_EVIDENCE);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<MatchingResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.matchedSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleInspect = (cand: MatchingResult) => {
    setSelectedCandidate(cand);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cohort Student Evidence Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect student profiles, proctored assessment benchmarks, and verified codebase audits across the 2026 graduating cohort.
        </p>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or skill..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Department:
            </span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Comm.">Electronics & Comm.</option>
            </select>
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
                <th className="p-4">Proctored Benchmark</th>
                <th className="p-4">Verified Skills</th>
                <th className="p-4">Identified Gaps</th>
                <th className="p-4 text-right">Evidence Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cand) => (
                <tr key={cand.studentId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={cand.studentName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{cand.studentName}</p>
                        <p className="text-[10px] text-slate-500">{cand.studentEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">
                    {cand.department} • <strong className="text-slate-900">{cand.cgpa}</strong>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {cand.assessmentScore}% Score
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {cand.matchedSkills.map((sk) => (
                        <Badge key={sk} variant="success" size="sm">
                          {sk}
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
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspect(cand)}
                      className="font-semibold"
                    >
                      Inspect Evidence
                    </Button>
                  </td>
                </tr>
              ))}
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Verified Evidence Artifacts & Scrutiny
              </h4>
              <div className="space-y-2">
                {evidenceList.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <Badge variant={ev.status === 'VERIFIED' ? 'success' : 'default'} size="sm">
                        {ev.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-[11px]">{ev.details}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>Verifier: {ev.verifier}</span>
                      <span>Date: {ev.date}</span>
                    </div>

                    {/* Reviewer Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Scrutiny Action:
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await placementApi.reviewEvidence(ev.id, 'MANUALLY_REVIEWED', 'Dr. Ramesh Sharma (Placement Cell)', 'Evidence approved following code review');
                              setEvidenceList((prev) =>
                                prev.map((item) => (item.id === ev.id ? { ...item, status: 'VERIFIED' as any } : item))
                              );
                              showToast(`Artifact ${ev.title} approved and verified.`, 'success');
                            } catch {
                              showToast('Failed to update evidence status.', 'error');
                            }
                          }}
                          className="text-[10px] text-emerald-700 hover:bg-emerald-50 h-7 px-2 font-semibold"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await placementApi.reviewEvidence(ev.id, 'NEEDS_REVISION', 'Dr. Ramesh Sharma (Placement Cell)', 'Insufficient test coverage');
                              setEvidenceList((prev) =>
                                prev.map((item) => (item.id === ev.id ? { ...item, status: 'NEEDS_REVIEW' as any } : item))
                              );
                              showToast(`Revision requested for artifact ${ev.title}.`, 'warning');
                            } catch {
                              showToast('Failed to update evidence status.', 'error');
                            }
                          }}
                          className="text-[10px] text-amber-700 hover:bg-amber-50 h-7 px-2 font-semibold"
                        >
                          Request Revision
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await placementApi.reviewEvidence(ev.id, 'REJECTED', 'Dr. Ramesh Sharma (Placement Cell)', 'Unverifiable project link');
                              setEvidenceList((prev) =>
                                prev.map((item) => (item.id === ev.id ? { ...item, status: 'UNVERIFIED' as any } : item))
                              );
                              showToast(`Artifact ${ev.title} rejected.`, 'error');
                            } catch {
                              showToast('Failed to update evidence status.', 'error');
                            }
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
