import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function FindJobsPage({
  jobs,
  onOpenMatchModal,
  onApply,
  onBookmark,
  bookmarkedJobIds = [],
  appliedJobIds = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');

  // Filter skills list
  const availableSkills = ['All', 'React', 'JavaScript', 'Node.js', 'Python', 'Java', 'Git'];

  // Filter logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search term
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Work mode
      const matchesWorkMode =
        selectedWorkMode === 'All' || job.workMode.toLowerCase() === selectedWorkMode.toLowerCase();

      // Match Score
      const matchesScore = job.matchScore >= minMatchScore;

      // Skill Filter
      const matchesSkill =
        selectedSkillFilter === 'All' ||
        job.matchedSkills.some((s) => s.toLowerCase().includes(selectedSkillFilter.toLowerCase())) ||
        job.missingSkills?.some((s) => s.toLowerCase().includes(selectedSkillFilter.toLowerCase()));

      return matchesSearch && matchesWorkMode && matchesScore && matchesSkill;
    });
  }, [jobs, searchTerm, selectedWorkMode, minMatchScore, selectedSkillFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
              Verifiable Matching
            </span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
              {filteredJobs.length} Positions Available
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mt-1">Explore Evidence-Matched Jobs</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Every match is calculated by cross-referencing your verified repository commits, proctored tests, and real projects against employer requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
            <span className="block text-xl font-black text-emerald-400">94%</span>
            <span className="text-[10px] text-slate-300 font-medium">Top Match Fit</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
            <span className="block text-xl font-black text-violet-300">12</span>
            <span className="text-[10px] text-slate-300 font-medium">Verified Skills</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Work Mode Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 ml-1 mr-1">
              <MapPin className="w-3.5 h-3.5" /> Mode:
            </span>
            {['All', 'Remote', 'Hybrid', 'Onsite'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedWorkMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedWorkMode === mode
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Line: Match Score & Required Skill */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Min Match:
            </span>
            {[
              { label: 'All Fits', val: 0 },
              { label: '70%+', val: 70 },
              { label: '80%+', val: 80 },
              { label: '90%+ Strong', val: 90 }
            ].map((scoreItem) => (
              <button
                key={scoreItem.val}
                onClick={() => setMinMatchScore(scoreItem.val)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  minMatchScore === scoreItem.val
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {scoreItem.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Skill Filter:</span>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none"
            >
              {availableSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count and Active Filter Indicator */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{filteredJobs.length}</span> matching opportunities
        </p>
        {(searchTerm || selectedWorkMode !== 'All' || minMatchScore > 0 || selectedSkillFilter !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedWorkMode('All');
              setMinMatchScore(0);
              setSelectedSkillFilter('All');
            }}
            className="text-xs text-violet-600 hover:text-violet-700 font-semibold underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No jobs match your current filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, lowering the minimum match score, or clearing the selected skill filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedWorkMode('All');
              setMinMatchScore(0);
              setSelectedSkillFilter('All');
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-violet-600 rounded-lg shadow-sm"
          >
            Show All Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isBookmarked = bookmarkedJobIds.includes(job.id) || job.bookmarked;
            const isApplied = appliedJobIds.includes(job.id) || job.applied;

            return (
              <div
                key={job.id}
                className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-violet-300 transition-all duration-200"
              >
                <div>
                  {/* Top Bar: Company logo, Title, Match percentage */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${job.logoColor} flex items-center justify-center text-white font-extrabold text-base shadow-md`}>
                        {job.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">{job.company}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {job.workMode}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex flex-col items-end">
                      <div className={`flex items-center justify-center px-3 py-1 rounded-xl text-xs font-extrabold shadow-2xs ${
                        job.matchScore >= 90
                          ? 'bg-violet-600 text-white'
                          : job.matchScore >= 80
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}>
                        {job.matchScore}% Match
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 mt-1">Verified Fit</span>
                    </div>
                  </div>

                  {/* Metadata: Location, Stipend, Deadline */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.stipend}
                    </span>
                    <span className="text-slate-400">• Posted {job.postedDate}</span>
                  </div>

                  {/* Skills Matched (Evidence-backed) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Matched & Proven Skills:</span>
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

                    {/* Missing Skills / Gap */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Identified Skill Gap:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(job.missingSkills || [job.gap]).map((gap) => (
                          <span
                            key={gap}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-800 rounded border border-amber-200"
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Evidence explanation snippet */}
                  <div className="mt-3 p-2.5 rounded-lg bg-violet-50/50 border border-violet-100/70 text-[11px] text-slate-700 leading-snug">
                    <span className="font-bold text-violet-900">Why You Match: </span>
                    {job.matchReason}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onBookmark(job.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      isBookmarked
                        ? 'bg-violet-50 text-violet-700 border-violet-300'
                        : 'text-slate-400 hover:text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={isBookmarked ? 'Saved' : 'Save Job'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-violet-600' : ''}`} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMatchModal(job)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      View Match Details
                    </button>
                    <button
                      onClick={() => onApply(job.id)}
                      disabled={isApplied}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        isApplied
                          ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-600/30'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isApplied ? 'Applied' : 'Apply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
