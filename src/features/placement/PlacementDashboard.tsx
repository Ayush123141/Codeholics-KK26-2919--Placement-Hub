import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users2, 
  Award, 
  AlertTriangle, 
  Send, 
  ArrowRight, 
  CopyCheck, 
  CheckCircle2, 
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/data-display/StatCard';
import { MotionFadeIn, MotionStagger, MotionStaggerItem } from '@/components/motion/MotionFadeIn';
import { placementApi } from '@/lib/api/placementApi';
import { Campaign, JobSource, MatchingResult } from '@/types';

export const PlacementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [topRanked, setTopRanked] = useState<MatchingResult[]>([]);

  useEffect(() => {
    async function loadData() {
      const [m, c, s, r] = await Promise.all([
        placementApi.getMetrics(),
        placementApi.getCampaigns(),
        placementApi.getJobSources(),
        placementApi.runBatchRanking('job-demo-001'),
      ]);
      setMetrics(m);
      setCampaigns(c);
      setSources(s);
      setTopRanked(r.results.slice(0, 3));
    }
    loadData();
  }, []);

  if (!metrics) return null;

  const duplicateWarningsCount = sources.filter((s) => s.duplicateWarning).length;

  return (
    <div className="space-y-6">
      {/* Institutional Header Banner */}
      <MotionFadeIn direction="down" duration={0.4}>
        <div className="rounded-xl bg-white p-6 sm:p-7 text-slate-900 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="eyebrow !mb-1">Central Placement Cell</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Placement Operations Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              TechSummitTrainers cohort management, duplicate job detection across ingested sources, and deterministic batch ranking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/placement/job-ingestion')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Review Ingested Jobs
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/placement/batch-ranking')}
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
            >
              <span>Run Batch Ranking</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </MotionFadeIn>

      {/* KPI Stats */}
      <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionStaggerItem>
          <StatCard
            title="Active Campaigns"
            value={metrics.activeCampaigns}
            subtitle="CloudScale & Nexus Drives"
            icon={<Target className="w-5 h-5" />}
            color="brand"
          />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <StatCard
            title="Cohort Students"
            value={metrics.cohortSize}
            subtitle="2026 Batch (CS & IT)"
            icon={<Users2 className="w-5 h-5" />}
            color="slate"
          />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <StatCard
            title="Assessment Rate"
            value={metrics.assessmentCompletionRate}
            subtitle="Proctored benchmarks"
            icon={<Award className="w-5 h-5" />}
            color="emerald"
          />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <StatCard
            title="Duplicate Warnings"
            value={duplicateWarningsCount}
            subtitle="Awaiting officer resolution"
            icon={<CopyCheck className="w-5 h-5 text-amber-600" />}
            color="amber"
          />
        </MotionStaggerItem>
      </MotionStagger>

      {/* Main Row: Campaigns & Batch Ranking Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Active Placement Campaigns</CardTitle>
                <CardDescription>
                  Live institutional recruitment drives mapped to verified student cohorts
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/placement/campaigns')}
                className="text-brand-600 font-semibold"
              >
                Manage All
              </Button>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{camp.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Role: <strong>{camp.jobTitle}</strong> • Cohort: {camp.cohortName}
                      </p>
                    </div>
                    <Badge variant={camp.status === 'SHORTLISTING' ? 'purple' : 'info'}>
                      {camp.status}
                    </Badge>
                  </div>

                  {/* Campaign stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Target Hires</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">{camp.targetHires}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Applicants</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">{camp.totalApplicants}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Shortlisted</p>
                      <p className="font-extrabold mt-0.5">{camp.shortlistedCount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-900">
                      <p className="text-[10px] text-brand-700 font-bold uppercase">In Interview</p>
                      <p className="font-extrabold mt-0.5">{camp.interviewCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      Policy: {camp.policyVersion}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/placement/batch-ranking')}
                      className="font-bold gap-1"
                    >
                      <span>Review Batch Ranking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Duplicate Alerts */}
          {duplicateWarningsCount > 0 && (
            <Card className="border-amber-200 bg-amber-50/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-sm">
                    {duplicateWarningsCount} Job Ingestion Duplicate Warning{duplicateWarningsCount > 1 ? 's' : ''}
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/placement/job-ingestion')}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100/50"
                >
                  Inspect & Resolve
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Incoming openings from Alumni Referrals and National Placement Exchange match active company postings. The backend has flagged them for human review to prevent duplicate spam without losing provenance history.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Top Ranked Batch Snapshot */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Ranked Candidate Leaders</CardTitle>
                <Badge variant="purple" size="sm">CloudScale Drive</Badge>
              </div>
              <CardDescription>
                Top evidence-backed matches evaluated by deterministic matching policy
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {topRanked.map((cand, idx) => (
                <div
                  key={cand.studentId}
                  className="p-3 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{cand.studentName}</p>
                        <p className="text-[10px] text-slate-500">{cand.department} • CGPA {cand.cgpa}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cand.fitScore}% Fit
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {cand.matchedSkills.map((sk) => (
                      <Badge key={sk} variant="success" size="sm">
                        {sk}
                      </Badge>
                    ))}
                    {cand.noEvidenceSkills.map((sk) => (
                      <Badge key={sk} variant="default" size="sm">
                        Missing: {sk}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/placement/batch-ranking')}
                className="w-full mt-2 font-bold"
              >
                Open Full Ranking Table
              </Button>
            </CardContent>
          </Card>

          {/* Application Pipeline Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Application Funnel by Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs font-medium">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">Applied (Pending Review)</span>
                <span className="font-bold text-slate-900">{metrics.applicationsByStage.applied}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 text-purple-900">
                <span>Officially Shortlisted</span>
                <span className="font-bold">{metrics.applicationsByStage.shortlisted}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-brand-50 text-brand-900">
                <span>Technical Interview Scheduled</span>
                <span className="font-bold">{metrics.applicationsByStage.interview}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <span>Offers Extended</span>
                <span className="font-bold">{metrics.applicationsByStage.offer}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
