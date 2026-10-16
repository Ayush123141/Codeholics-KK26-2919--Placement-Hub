import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  Layers,
  ArrowRight,
  GitMerge,
  BarChart3
} from 'lucide-react';

export default function PlacementInsightsPage({ analytics, jobs, onShowToast }) {
  const [selectedJobId, setSelectedJobId] = useState('job-1');
  const [candidateSearch, setCandidateSearch] = useState('');

  const currentRankings = analytics.candidateRankingsByJob[selectedJobId] || analytics.candidateRankingsByJob['job-1'] || [];

  const filteredRankings = currentRankings.filter(
    (c) =>
      c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.department.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleMergeDuplicate = (dupId) => {
    onShowToast({
      type: 'info',
      title: 'Job Postings Consolidated',
      message: 'Duplicate job postings successfully merged into a single verified listing.'
    });
  };

  const handleShortlistCandidate = (candName) => {
    onShowToast({
      type: 'success',
      title: 'Candidate Shortlisted',
      message: `${candName} has been moved to the interview pool for ${selectedJob.company}.`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Officer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c111d] text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Users className="w-4 h-4 text-amber-400" />
            <span>University Placement Cell Dashboard • Officer Portal</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">Placement Cohort Analytics & Candidate Ranking</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time batch intelligence: verify student capabilities against employer requirements, prevent duplicate postings, and rank candidates using verified proof rather than inflated claims.
          </p>
        </div>

        <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center self-start md:self-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch Placed</span>
          <span className="text-xl font-black text-emerald-400">45 Students</span>
          <span className="text-[10px] text-slate-300 block">Target: 320</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Eligible */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Eligible Students</span>
            <Users className="w-4 h-4 text-violet-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{analytics.totalStudents}</div>
          <p className="mt-1 text-[11px] text-slate-500">Graduating Class of 2026</p>
        </div>

        {/* Available Jobs */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Job Postings</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{analytics.availableJobs}</div>
          <p className="mt-1 text-[11px] text-blue-600 font-semibold">18 campus partner companies</p>
        </div>

        {/* Students Matched */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Students Matched</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{analytics.matchedStudentsCount}</span>
            <span className="text-xs font-bold text-emerald-600">{analytics.matchRate}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Over 70% skill fit achieved</p>
        </div>

        {/* Pipeline Total */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Applications</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {analytics.pipelineStats.applied}
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {analytics.pipelineStats.placed} Placed • {analytics.pipelineStats.interview} in Interviews
          </p>
        </div>
      </div>

      {/* Cohort Pipeline & Skill Demand Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Requested Skills (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Highest Industry Demand Skills</h3>
              <p className="text-xs text-slate-500">Derived from 38 active corporate internship descriptions</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Aggregated
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.topSkillsDemand.map((item) => (
              <div key={item.skill} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.skill}</span>
                  <span className="text-slate-500">{item.count} roles ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Possible Duplicate Job Postings Alerts (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Duplicate Job Alerts</h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                2 Flagged
              </span>
            </div>
            <span className="text-xs text-slate-400">Campus Hygiene Check</span>
          </div>
          <p className="text-xs text-slate-500">
            Preventing students from applying multiple times to duplicated roles from the same company:
          </p>

          <div className="space-y-3 pt-1">
            {analytics.duplicateAlerts.map((dup) => (
              <div
                key={dup.id}
                className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    {dup.company}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                    {dup.similarity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-0.5">
                  <p>• Post A: <em>"{dup.titleA}"</em></p>
                  <p>• Post B: <em>"{dup.titleB}"</em></p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">{dup.postedTimes}</span>
                  <button
                    onClick={() => handleMergeDuplicate(dup.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-md transition-colors"
                  >
                    <GitMerge className="w-3 h-3" />
                    <span>{dup.action}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batch-Matching Panel: "Match Students to a Job" */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h3 className="text-lg font-bold text-slate-900">Batch AI Matcher: Rank Students to a Role</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an open job to dynamically calculate verified candidate rankings across the student body.
            </p>
          </div>

          {/* Job Select Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">Target Role:</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.company} — {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Job Mini Spec */}
        <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Active Job Target</span>
            <p className="text-sm font-extrabold text-slate-900">{selectedJob.title} at {selectedJob.company}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-slate-500">Core criteria:</span>
              {selectedJob.matchedSkills.map((sk) => (
                <span key={sk} className="font-semibold bg-white px-2 py-0.5 rounded border border-violet-200 text-slate-800 text-[10px]">
                  {sk}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-violet-700">{filteredRankings.length} Ranked Candidates</span>
            <p className="text-[11px] text-slate-500">Sorted by Evidence-Backed Match Score</p>
          </div>
        </div>

        {/* Search Candidates Input */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidate name or department..."
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500"
          />
        </div>

        {/* Ranked Candidate Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Rank & Candidate</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Matched & Proven Skills</th>
                <th className="py-3 px-4">Evidence Summary</th>
                <th className="py-3 px-4">Identified Gap</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRankings.map((cand, idx) => (
                <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Rank & Candidate */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-extrabold text-slate-400">#{idx + 1}</span>
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{cand.name}</p>
                        <p className="text-[10px] text-slate-500">{cand.department} • GPA: {cand.gpa}</p>
                      </div>
                    </div>
                  </td>

                  {/* Match Score */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-lg text-xs">
                        {cand.matchScore}%
                      </span>
                    </div>
                  </td>

                  {/* Skills Matched */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {cand.matchedSkills.map((sk) => (
                        <span key={sk} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Evidence Summary */}
                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-[11px] text-slate-600 font-medium line-clamp-2">
                      {cand.evidenceSummary}
                    </span>
                  </td>

                  {/* Missing Requirement */}
                  <td className="py-3 px-4">
                    <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {cand.missingSkills?.join(', ') || 'None'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleShortlistCandidate(cand.name)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-violet-600 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                    >
                      Shortlist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
