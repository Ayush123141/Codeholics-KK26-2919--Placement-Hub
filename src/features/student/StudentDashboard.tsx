import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/data-display/StatCard';
import { EvidenceBadge } from '@/components/data-display/EvidenceBadge';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { DashboardSkeleton } from '@/components/feedback/LoadingSkeleton';
import { studentApi } from '@/lib/api/studentApi';
import { UserProfile, StudentSkill, Job, Application, EvidenceRecord } from '@/types';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, sk, jb, apps, ev] = await Promise.all([
          studentApi.getProfile(),
          studentApi.getSkills(),
          studentApi.getJobs(),
          studentApi.getApplications(),
          studentApi.getEvidence(),
        ]);
        setProfile(prof);
        setSkills(sk);
        setJobs(jb);
        setApplications(apps);
        setEvidenceList(ev);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !profile) {
    return <DashboardSkeleton />;
  }

  const verifiedSkillsCount = skills.filter((s) => s.status === 'VERIFIED').length;
  const reviewedSkillsCount = skills.filter((s) => s.status === 'REVIEWED').length;
  const needsReviewCount = skills.filter((s) => s.status === 'NEEDS_REVIEW').length;
  const noEvidenceCount = skills.filter((s) => s.status === 'NO_EVIDENCE').length;

  const activeApplication = applications[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence-First Profile Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your profile is backed by <strong className="text-white">{evidenceList.length} verified evidence artifacts</strong>. Placement matching engines evaluate your skills deterministically based on proof, not unverified claims.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/student/evidence')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs"
            >
              Inspect Evidence
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/student/jobs')}
              className="bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/30"
            >
              <span>Explore Vacancies</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified Skills"
          value={verifiedSkillsCount}
          subtitle={`Across ${skills.length} tracked skills`}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Evidence Artifacts"
          value={evidenceList.length}
          subtitle="Assessments, repos & rubrics"
          icon={<Award className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Top Match Fit"
          value={`${jobs[0]?.matchedScore || 82}%`}
          subtitle={jobs[0]?.company || 'CloudScale Technologies'}
          icon={<TrendingUp className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Active Pipeline"
          value={applications.length}
          subtitle="Stage: Interview Round 1"
          icon={<Briefcase className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Main Grid: Evidence Summary + Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills & Evidence Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Breakdown */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Skill Proof & Verification Status</CardTitle>
                <CardDescription>
                  Skills backed by proctored assessments, GitHub audits, or evaluated coursework
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student/evidence')}
                className="text-brand-600 hover:text-brand-700 font-semibold"
              >
                View Registry
              </Button>
            </CardHeader>

            <CardContent>
              {/* Evidence Status Bar */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {verifiedSkillsCount} Verified
                </span>
                <span className="inline-flex items-center gap-1.5 text-blue-700">
                  <Clock className="w-3.5 h-3.5" />
                  {reviewedSkillsCount} Reviewed
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {needsReviewCount} Needs Review
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  {noEvidenceCount} No Evidence
                </span>
              </div>

              {/* Skill Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => navigate('/student/evidence')}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-brand-300 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {skill.canonicalName}
                        </span>
                        <span className="text-[10px] text-slate-400">({skill.proficiencyLevel})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {skill.evidenceCount > 0
                          ? `${skill.evidenceCount} supporting evidence records`
                          : 'No linked evidence recorded'}
                      </p>
                    </div>
                    <EvidenceBadge status={skill.status} size="sm" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suitable Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Evidence-Matched Vacancies</CardTitle>
                <CardDescription>
                  Deterministic fit scores calculated against your recorded evidence
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student/jobs')}
                className="text-brand-600 hover:text-brand-700 font-semibold"
              >
                All Jobs ({jobs.length})
              </Button>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {jobs.slice(0, 2).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-brand-700 font-semibold">{job.salaryRange}</span>
                      </div>
                    </div>
                    {job.hasApplied ? (
                      <Badge variant="success">Applied & In Review</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => navigate('/student/jobs')}
                        className="self-start sm:self-auto"
                      >
                        Review Match & Apply
                      </Button>
                    )}
                  </div>

                  {/* Match Score bar */}
                  <MatchScoreBar score={job.matchedScore} policyVersion="v1.0-80/20" size="sm" />

                  {/* Skills tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                      Required:
                    </span>
                    {job.requiredSkills.map((req) => (
                      <Badge key={req.skillId} variant="default" size="sm">
                        {req.canonicalName}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Applications, Interview, & Skill Gaps */}
        <div className="space-y-6">
          {/* Upcoming Interview Card */}
          {activeApplication?.interviewDate && (
            <Card className="border-brand-200 bg-brand-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-brand-700">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Upcoming Interview
                  </span>
                </div>
                <CardTitle className="text-sm font-bold mt-1">
                  {activeApplication.jobTitle}
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium">
                  {activeApplication.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="p-3 bg-white rounded-lg border border-brand-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{activeApplication.interviewDate}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {activeApplication.interviewNotes}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/student/applications')}
                  className="w-full text-brand-700 border-brand-300 hover:bg-brand-100/50"
                >
                  View Application Timeline
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Skill Gaps to Address */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Identified Skill Gaps</CardTitle>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <CardDescription>
                Skills prioritized by active hiring campaigns that lack verified proof
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">PostgreSQL</span>
                  <Badge variant="warning" size="sm">Review Pending</Badge>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Certificate uploaded without automated ledger check. Requires manual placement officer verification.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Docker</span>
                  <Badge variant="default" size="sm">No Evidence</Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Preferred skill for Systems Engineer roles. Link a containerized GitHub repository to boost match fit.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/evidence')}
                className="w-full"
              >
                Submit Evidence Artifact
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resume & Verification Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate('/student/resume-studio')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Resume Studio</p>
                    <p className="text-[10px] text-slate-500">Generate evidence-backed resume</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/student/claim-review')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Resume Claim Review</p>
                    <p className="text-[10px] text-slate-500">Audit uploaded PDF claims</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
