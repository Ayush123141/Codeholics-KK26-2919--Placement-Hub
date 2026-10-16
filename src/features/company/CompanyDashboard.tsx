import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users2, 
  Calendar, 
  Award, 
  ArrowRight, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/data-display/StatCard';
import { companyApi } from '@/lib/api/companyApi';
import { Job, MatchingResult } from '@/types';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [vacancies, setVacancies] = useState<Job[]>([]);
  const [shortlist, setShortlist] = useState<MatchingResult[]>([]);

  useEffect(() => {
    async function loadData() {
      const [m, vac, sh] = await Promise.all([
        companyApi.getMetrics(),
        companyApi.getVacancies(),
        companyApi.getSharedShortlist(),
      ]);
      setMetrics(m);
      setVacancies(vac);
      setShortlist(sh);
    }
    loadData();
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Banner: Solid surface matching reference rules */}
      <div className="rounded-[14px] bg-white p-6 sm:p-7 text-ink border border-line shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="eyebrow !mb-1">Hiring Partner Portal</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Corporate Recruitment Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Review authorized, evidence-backed candidate shortlists vetted by TechSummitTrainers. No unsupported resume claims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/company/vacancies')}
            className="text-xs font-mono font-bold"
          >
            Manage Vacancies
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/company/candidates')}
            className="bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/30"
          >
            <span>Review Shortlist ({shortlist.length})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Vacancies"
          value={metrics.activeVacancies}
          subtitle="Platform Engineering Openings"
          icon={<Briefcase className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Shared Shortlist"
          value={metrics.sharedCandidates}
          subtitle="Institute-vetted candidates"
          icon={<Users2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Interviews In Progress"
          value={metrics.interviewsScheduled}
          subtitle="Technical assessment rounds"
          icon={<Calendar className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Offers Extended"
          value={metrics.offersExtended}
          subtitle="Final decision phase"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Main Grid: Shortlist Leaders + Active Vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Shared Candidate Shortlist Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Institute-Approved Candidate Shortlist</CardTitle>
                <CardDescription>
                  Candidates whose verified evidence meets your vacancy's required skills
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/company/candidates')}
                className="text-brand-600 font-semibold"
              >
                Inspect All ({shortlist.length})
              </Button>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {shortlist.map((cand) => (
                <div
                  key={cand.studentId}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={cand.studentName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{cand.studentName}</h4>
                        <p className="text-xs text-slate-500">
                          {cand.department} • CGPA {cand.cgpa} • Benchmark: {cand.assessmentScore}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {cand.fitScore}% Fit
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/company/candidates')}
                      >
                        Inspect Proof
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {cand.explanation}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                      Verified Skills:
                    </span>
                    {cand.matchedSkills.map((sk) => (
                      <Badge key={sk} variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-0.5" />
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Active Vacancy Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Posted Vacancies</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/company/vacancies')}
                className="text-brand-600"
              >
                + Post Job
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {vacancies.map((v) => (
                <div key={v.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{v.title}</h4>
                      <p className="text-[11px] text-slate-500">{v.location} • {v.type}</p>
                    </div>
                    <Badge variant="info" size="sm">{v.status}</Badge>
                  </div>
                  <p className="text-[11px] font-semibold text-brand-700">{v.salaryRange}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy & Evidence Notice */}
          <Card className="border-brand-200 bg-brand-50/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-brand-800">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Evidence Access Policy</span>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-brand-900 space-y-1.5 leading-relaxed">
              <p>
                Recruiters see only authorized candidate work products and benchmark results explicitly shared with this campaign.
              </p>
              <p className="text-[11px] text-brand-700 font-medium">
                Unrestricted academic transcripts and personal files remain confidential with the institute.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
