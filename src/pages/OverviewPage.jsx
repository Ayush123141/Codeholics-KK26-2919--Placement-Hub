import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  Award,
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';

export default function OverviewPage({
  profile,
  jobs,
  skills,
  applications,
  activities,
  onNavigate,
  onOpenMatchModal,
  onOpenAddEvidence
}) {
  // Top 3 featured jobs
  const topJobs = jobs.slice(0, 3);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'Evidence found':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            Evidence found
          </span>
        );
      case 'Needs review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Needs review
          </span>
        );
      case 'Unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            Unverified
          </span>
        );
    }
  };

  const getApplicationStatusPill = (status) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
      case 'Interview':
        return 'bg-violet-100 text-violet-800 border-violet-200 font-bold';
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 border-blue-200 font-semibold';
      case 'Applied':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c111d] via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-3 border border-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Placement Matching Active • 8 Strong Matches</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Good morning, {profile.name} 👋
          </h2>
          <p className="mt-2 text-sm md:text-base text-slate-300 font-normal leading-relaxed">
            Your skills deserve more than claims. Let's prove what you can do.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('find-jobs')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transition-all transform active:scale-95"
            >
              <span>Explore Matched Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-sm transition-all"
            >
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Build My Resume</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-violet-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Profile Strength */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Profile Strength</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{profile.profileStrength}%</span>
            <span className="text-xs font-semibold text-emerald-600">+4% this week</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profile.profileStrength}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">Evidence-backed profile</p>
        </div>

        {/* Card 2: Skills with Evidence */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Skills with Evidence</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{profile.verifiedSkillsCount} of {profile.totalSkillsCount}</span>
            <span className="text-xs font-semibold text-emerald-600">80% proven</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-4/5" />
          </div>
          <p className="mt-2 text-[11px] text-amber-600 font-medium">3 skills need more proof</p>
        </div>

        {/* Card 3: Matched Opportunities */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Matched Opportunities</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">24 jobs</span>
            <span className="text-xs font-semibold text-violet-600">Active</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span>8 strong matches (&gt;80%)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">Filtered by verifiable skill overlap</p>
        </div>

        {/* Card 4: Active Applications */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Applications</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{applications.length} applications</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">2 interviews upcoming</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">1 pre-placement offer received</p>
        </div>
      </div>

      {/* 3. AI Job Match Section: "Your Best Opportunities" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Your Best Opportunities</h3>
              <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full border border-violet-200">
                AI Match Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by verified skills, repository commits, and assessment evidence.
            </p>
          </div>
          <button
            onClick={() => onNavigate('find-jobs')}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <span>View All 24 Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topJobs.map((job) => (
            <div
              key={job.id}
              className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xl hover:border-violet-300 transition-all duration-200"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${job.logoColor} flex items-center justify-center text-white font-extrabold text-base shadow-md`}>
                      {job.logo}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500">{job.company}</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-violet-600 transition-colors">
                        {job.title}
                      </h4>
                    </div>
                  </div>

                  {/* Circular / Badge Match Indicator */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-extrabold text-sm shadow-2xs">
                      {job.matchScore}%
                    </div>
                    <span className="text-[9px] font-bold text-violet-600 mt-1 uppercase tracking-wide">Match</span>
                  </div>
                </div>

                {/* Skills Matched */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Skills Matched:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded border border-emerald-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence Proof & Gap */}
                <div className="mt-3 space-y-1.5 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                    <span><strong className="text-slate-800">Evidence:</strong> {job.evidenceSummary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span><strong className="text-amber-900">Gap:</strong> {job.gap}</span>
                  </div>
                </div>

                {/* AI Explanation preview */}
                <p className="mt-3 text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic">
                  "{job.matchReason}"
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{job.stipend}</span>
                <button
                  onClick={() => onOpenMatchModal(job)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-violet-600 rounded-lg transition-colors shadow-2xs"
                >
                  <span>View Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Skill Evidence Overview & Pipeline Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): "Your Skills, Backed by Evidence" */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Your Skills, Backed by Evidence</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Audit Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Claims linked to GitHub repositories, proctored assessments, and project code.
              </p>
            </div>
            <button
              onClick={() => onNavigate('evidence')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <span>View All Evidence</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skills List */}
          <div className="space-y-3 pt-2">
            {skills.slice(0, 5).map((sk) => (
              <div
                key={sk.id}
                className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-800">{sk.skill}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({sk.category})</span>
                  </div>
                  <div>{getStatusBadge(sk.status)}</div>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        sk.status === 'Verified'
                          ? 'bg-emerald-500'
                          : sk.status === 'Evidence found'
                          ? 'bg-blue-500'
                          : sk.status === 'Needs review'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${sk.evidenceScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 min-w-[32px] text-right">
                    {sk.evidenceScore}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[280px]">
                    <strong className="text-slate-700">Proof:</strong> {sk.sourceName}
                  </span>
                  <span className="text-slate-400">{sk.dateAdded}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 flex items-center justify-between">
              <div className="text-xs text-violet-900">
                <span className="font-bold">Missing Proof for TypeScript?</span>
                <p className="text-[11px] text-violet-700 mt-0.5">
                  Adding a verified TypeScript repository will boost match score on 14 additional jobs.
                </p>
              </div>
              <button
                onClick={onOpenAddEvidence}
                className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-2xs whitespace-nowrap ml-3"
              >
                Add Proof
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Application Pipeline & Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Application Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Pipeline</h3>
                <p className="text-xs text-slate-500">Real-time status across tracked roles</p>
              </div>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <span>Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pipeline Step Counters */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg font-black text-slate-800">6</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">Applied</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-lg font-black text-blue-700">3</span>
                <span className="block text-[10px] font-bold text-blue-500 uppercase mt-0.5">Shortlist</span>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-100">
                <span className="text-lg font-black text-violet-700">2</span>
                <span className="block text-[10px] font-bold text-violet-500 uppercase mt-0.5">Interview</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-lg font-black text-emerald-700">1</span>
                <span className="block text-[10px] font-bold text-emerald-500 uppercase mt-0.5">Offer</span>
              </div>
            </div>

            {/* Compact application list */}
            <div className="space-y-2 pt-1">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{app.role}</p>
                    <p className="text-[11px] text-slate-500 truncate">{app.company} • Applied {app.appliedDate}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getApplicationStatusPill(app.status)} ml-2 flex-shrink-0`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <div className="space-y-3 pt-1">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-600 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
