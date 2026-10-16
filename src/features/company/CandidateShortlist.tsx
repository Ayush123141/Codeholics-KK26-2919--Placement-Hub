import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Send, 
  ExternalLink,
  Lock,
  Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { companyApi } from '@/lib/api/companyApi';
import { MatchingResult } from '@/types';

export const CandidateShortlist: React.FC = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<MatchingResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchingResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  // Schedule interview form
  const [interviewDate, setInterviewDate] = useState('2026-10-24T14:30');
  const [interviewNotes, setInterviewNotes] = useState('Technical Architecture Review with Platform Lead');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    async function loadShortlist() {
      const data = await companyApi.getSharedShortlist();
      setCandidates(data);
    }
    loadShortlist();
  }, []);

  const handleOpenDetail = (cand: MatchingResult) => {
    setSelectedCandidate(cand);
    setIsDetailOpen(true);
  };

  const handleOpenSchedule = (cand: MatchingResult) => {
    setSelectedCandidate(cand);
    setIsInterviewOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsScheduling(true);
    try {
      await companyApi.scheduleInterview(
        selectedCandidate.studentId,
        interviewDate,
        interviewNotes
      );
      setCandidates((prev) =>
        prev.map((c) =>
          c.studentId === selectedCandidate.studentId
            ? { ...c, applicationStage: 'INTERVIEW' }
            : c
        )
      );
      showToast('Interview confirmed and dispatched to student portal!', 'success');
      setIsInterviewOpen(false);
    } catch {
      showToast('Failed to schedule interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Shared Candidate Shortlist
            </h1>
            <Badge variant="success" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Institute Verified
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Candidates approved by TechSummitTrainers placement cell for CloudScale Technologies campus campaign.
          </p>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((cand) => (
          <Card key={cand.studentId} className="space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={cand.studentName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cand.studentName}</h3>
                    <p className="text-xs text-slate-500">
                      {cand.department} • CGPA {cand.cgpa}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {cand.fitScore}% Fit
                </span>
              </div>

              {/* Verified proof breakdown */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <p className="font-bold text-slate-800">Evaluator Rationale:</p>
                <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-3">
                  {cand.explanation}
                </p>
              </div>

              {/* Skills tags */}
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                    Verified Match:
                  </span>
                  {cand.matchedSkills.map((sk) => (
                    <Badge key={sk} variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-0.5" />
                      {sk}
                    </Badge>
                  ))}
                </div>

                {cand.noEvidenceSkills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                      Skill Gaps:
                    </span>
                    {cand.noEvidenceSkills.map((sk) => (
                      <Badge key={sk} variant="default" size="sm">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(cand)}
                className="text-xs font-semibold"
              >
                Inspect Proof
              </Button>

              <Button
                size="sm"
                onClick={() => handleOpenSchedule(cand)}
                className="gap-1.5 text-xs font-bold"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {cand.applicationStage === 'INTERVIEW' ? 'Reschedule Interview' : 'Schedule Interview'}
                </span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Candidate Proof Inspection Modal (Sanitized Recruiter View) */}
      {selectedCandidate && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Authorized Proof Dossier: ${selectedCandidate.studentName}`}
          description={`Verified Candidate Fit: ${selectedCandidate.fitScore}% • Controlled Evidence View`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
              <span>
                Authorized Recruiter Scope: Displays proctored benchmarks and evaluated repository work products.
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">
                Proctored Technical Benchmark Summary
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Completed proctored multi-tier assessments in React hooks concurrency and TypeScript advanced generics with zero security flags.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-bold text-slate-700">Benchmark Score:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedCandidate.assessmentScore}% Proctored Result
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">
                Evaluated Code Repositories & Findings
              </h4>
              <p className="text-slate-600 leading-relaxed">
                AST scanner confirmed modular frontend architecture, custom error boundaries, and unit tests at <code>alexmorgan-dev/micro-frontend-shell</code>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Personal contact numbers and private certificates are held in escrow by the institute.</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Interview Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isInterviewOpen}
          onClose={() => setIsInterviewOpen(false)}
          title={`Schedule Technical Interview: ${selectedCandidate.studentName}`}
          description="Send calendar invitation and interview round specifications to candidate and placement cell."
          size="md"
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <Input
              label="Interview Date & Time"
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Interview Panel Notes & Agenda
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setIsInterviewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isScheduling}>
                Dispatch Invitation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
