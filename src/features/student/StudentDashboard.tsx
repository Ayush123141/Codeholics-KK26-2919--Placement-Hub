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
  ChevronRight,
  TrendingUp,
  FileText,
  ClipboardCheck,
  Building2,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/data-display/StatCard';
import { EvidenceBadge } from '@/components/data-display/EvidenceBadge';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { DashboardSkeleton } from '@/components/feedback/LoadingSkeleton';
import { studentApi } from '@/lib/api/studentApi';
import { placementApi } from '@/lib/api/placementApi';
import { MotionFadeIn, MotionStagger, MotionStaggerItem } from '@/components/motion/MotionFadeIn';
import { UserProfile, StudentSkill, Job, Application, EvidenceRecord, Campaign } from '@/types';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, sk, jb, apps, ev, camps] = await Promise.all([
          studentApi.getProfile(),
          studentApi.getSkills(),
          studentApi.getJobs(),
          studentApi.getApplications(),
          studentApi.getEvidence(),
          placementApi.getCampaigns().catch(() => []),
        ]);
        setProfile(prof);
        setSkills(sk);
        setJobs(Array.isArray(jb) ? jb : []);
        setApplications(apps);
        setEvidenceList(ev);
        setCampaigns(Array.isArray(camps) ? camps : []);
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
      {/* Clean Institutional Header Card */}
      <MotionFadeIn direction="down" duration={0.4}>
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <span className="eyebrow !mb-1">Student Candidate Dashboard</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Welcome back, {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {profile.degree} • {profile.college} (CGPA: {profile.cgpa}/10.0). Your candidate profile is supported by{' '}
              <strong className="text-ink font-semibold">{evidenceList.length} verified evidence artifacts</strong> across proctored assessments and evaluated coursework.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/student/assessments')}
              className="text-xs font-semibold"
            >
              <ClipboardCheck className="w-4 h-4 mr-1 text-slate-600" />
              Take Skill Assessment
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/student/jobs')}
              className="text-xs font-semibold gap-1.5"
            >
              <span>Explore Vacancies</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </MotionFadeIn>

      {/* KPI Metrics */}
      <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionStaggerItem>
          <StatCard
            title="Verified Skills"
            value={verifiedSkillsCount}
            subtitle={`Across ${skills.length} tracked skills`}
            icon={<ShieldCheck className="w-5 h-5" />}
            color="brand"
          />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <StatCard
            title="Evidence Artifacts"
            value={evidenceList.length}
            subtitle="Assessments, repos & rubrics"
            icon={<Award className="w-5 h-5" />}
            color="emerald"
          />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <StatCard
            title="Top Match Fit"
            value={`${verifiedSkillsCount > 0 && jobs[0]?.matchedScore ? jobs[0].matchedScore : 0}%`}
            subtitle={verifiedSkillsCount > 0 && jobs[0]?.matchedScore ? (jobs[0].company || 'Verified Matches') : 'No verified skills recorded'}
            icon={<TrendingUp className="w-5 h-5" />}
            color="violet"
          />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <StatCard
            title="Active Applications"
            value={applications.length}
            subtitle={activeApplication ? (activeApplication.currentStage || 'Application under review') : 'No active applications'}
            icon={<Briefcase className="w-5 h-5" />}
            color="amber"
          />
        </MotionStaggerItem>
      </MotionStagger>

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
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
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
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {skill.canonicalName}
                        </span>
                        <span className="text-[11px] text-slate-400">({skill.proficiencyLevel})</span>
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

          {/* Active Placement Campaigns Card */}
          {campaigns.length > 0 && (
            <Card className="border-brand-200 bg-brand-50/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-brand-700 mb-0.5">
                    <Target className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Campus Drives</span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Active Institutional Placement Campaigns
                  </CardTitle>
                  <CardDescription>
                    Official hiring drives launched by your college placement office for the 2026 cohort
                  </CardDescription>
                </div>
                <Badge variant="purple">{campaigns.length} Active Drives</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaigns.slice(0, 3).map((camp) => (
                  <div
                    key={camp.id}
                    className="p-3.5 rounded-xl border border-brand-100 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{camp.title}</span>
                        <Badge variant="info" size="sm">{camp.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {camp.companyName}
                        </span>
                        <span>•</span>
                        <span>Role: <strong className="text-brand-700">{camp.jobTitle}</strong></span>
                        <span>•</span>
                        <span>Target: <strong>{camp.targetHires} Hires</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/student/resume-studio?jobId=${camp.jobId || camp.id}&role=${encodeURIComponent(camp.jobTitle)}&company=${encodeURIComponent(camp.companyName)}`)}
                        className="text-xs font-semibold gap-1 text-brand-700 border-brand-300 hover:bg-brand-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tailor Resume</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate('/student/jobs')}
                        className="text-xs font-semibold"
                      >
                        Review & Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}

                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
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
                        className="self-start sm:self-auto text-xs"
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
            <Card className="border-blue-200 bg-blue-50/40">
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
                <div className="p-3 bg-white rounded-lg border border-blue-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{activeApplication.interviewDate}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {activeApplication.interviewNotes}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/student/applications')}
                  className="w-full text-brand-700 border-brand-300 hover:bg-brand-50 text-xs"
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
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">PostgreSQL</span>
                  <Badge variant="warning" size="sm">Review Pending</Badge>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Certificate uploaded without automated ledger check. Requires manual placement officer verification.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Docker</span>
                  <Badge variant="default" size="sm">No Evidence</Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Preferred skill for Systems Engineer roles. Take an assessment or link a containerized GitHub repository to boost match fit.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/assessments')}
                className="w-full text-xs"
              >
                Take Assessment or Submit Evidence
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
