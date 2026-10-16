import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Send,
  MessageSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { companyApi } from '@/lib/api/companyApi';
import { MatchingResult } from '@/types';

export const InterviewPipeline: React.FC = () => {
  const [candidates, setCandidates] = useState<MatchingResult[]>([]);

  useEffect(() => {
    async function loadCandidates() {
      const data = await companyApi.getSharedShortlist();
      setCandidates(data);
    }
    loadCandidates();
  }, []);

  const pipelineColumns = [
    {
      id: 'SHORTLISTED',
      title: 'Shared Shortlist',
      badge: 'border-purple-200 bg-purple-50 text-purple-700',
      candidates: candidates.filter((c) => c.applicationStage === 'SHORTLISTED' || !c.applicationStage),
    },
    {
      id: 'INTERVIEW',
      title: 'Technical Round 1',
      badge: 'border-brand-200 bg-brand-50 text-brand-700',
      candidates: candidates.filter((c) => c.applicationStage === 'INTERVIEW'),
    },
    {
      id: 'OFFER',
      title: 'Final Offer Extended',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      candidates: candidates.filter((c) => c.applicationStage === 'OFFER'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Hiring Pipeline & Interview Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track candidates across evaluation rounds from initial institute shortlisting through final offer acceptance.
        </p>
      </div>

      {/* Kanban-style Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pipelineColumns.map((col) => (
          <div key={col.id} className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">{col.title}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${col.badge}`}>
                {col.candidates.length}
              </span>
            </div>

            <div className="space-y-3">
              {col.candidates.map((cand) => (
                <Card key={cand.studentId} className="space-y-3 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={cand.studentName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cand.studentName}</h4>
                        <p className="text-[10px] text-slate-500">{cand.department}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cand.fitScore}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                    {cand.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {cand.matchedSkills.map((sk) => (
                      <Badge key={sk} variant="success" size="sm">
                        {sk}
                      </Badge>
                    ))}
                  </div>

                  {col.id === 'INTERVIEW' && (
                    <div className="p-2 bg-brand-50/60 rounded border border-brand-200/80 text-[10px] text-brand-900 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-600" />
                      <span>Round 1: 2026-10-22 at 03:00 PM IST</span>
                    </div>
                  )}
                </Card>
              ))}

              {col.candidates.length === 0 && (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                  No candidates currently in this stage.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
