import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  FileText,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { JobDetailModal } from './JobDetailModal';
import { useToast } from '@/components/ui/Toast';
import { studentApi } from '@/lib/api/studentApi';
import { Job } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';

export const JobDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await studentApi.getJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load vacancies:', err);
      }
    }
    loadJobs();
  }, []);

  const handleOpenDetail = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleApply = async (jobId: string) => {
    setIsApplying(true);
    try {
      await studentApi.applyToJob(jobId);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, hasApplied: true } : j))
      );
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, hasApplied: true });
      }
      showToast('Application submitted with verified evidence summary!', 'success');
      setIsDetailOpen(false);
    } catch {
      showToast('Failed to submit application', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleGenerateResumeForJob = (jobId: string) => {
    navigate(`/student/resume-studio?jobId=${jobId}`);
  };

  const [sortBy, setSortBy] = useState<'MATCH_DESC' | 'DEADLINE_ASC' | 'TITLE_ASC'>('MATCH_DESC');

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setMinScore(0);
    setSortBy('MATCH_DESC');
  };

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || minScore > 0 || sortBy !== 'MATCH_DESC';

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some((s) => s.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || job.type === typeFilter;
      const matchesScore = (job.matchedScore || 0) >= minScore;
      return matchesSearch && matchesType && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === 'MATCH_DESC') {
        return (b.matchedScore || 0) - (a.matchedScore || 0);
      }
      if (sortBy === 'DEADLINE_ASC') {
        return a.deadline.localeCompare(b.deadline);
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6">
      {/* Page Header following reference rhythm */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow !mb-1">Campus Opportunities</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Explore Placement Openings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Browse verified institutional vacancies with deterministic 80/20 criteria matching against your evidence ledger.
          </p>
        </div>
        <div className="font-mono text-xs font-semibold px-3 py-1.5 rounded-full bg-paper-alt text-slate-700 border border-line self-start sm:self-auto shadow-xs">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'Opening Listed' : 'Openings Listed'}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4 space-y-3 border-line shadow-card bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, or skill..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-[8px] text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-[8px] border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 font-sans"
            >
              <option value="ALL">All Employment Types</option>
              <option value="Full-time">Full-time (Graduate Offer)</option>
              <option value="Internship">Internship + PPO</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-[8px] border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 font-sans"
            >
              <option value="MATCH_DESC">Sort: Highest Match Score</option>
              <option value="DEADLINE_ASC">Sort: Approaching Deadline</option>
              <option value="TITLE_ASC">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-slate-300 bg-white text-xs">
              <span className="font-mono text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                Min Fit: {minScore}%
              </span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => navigate('/login/student')} className="text-xs w-full font-mono">
                Sign In to View Matches
              </Button>
            </div>
          )}
        </div>

        {/* Active Filter Chips & Clear All */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line text-xs">
            <span className="font-mono text-[11px] text-slate-500 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-paper-alt text-slate-700 font-mono text-[11px] font-medium border border-line">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-ink font-bold">×</button>
              </span>
            )}
            {typeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-paper-alt text-slate-700 font-mono text-[11px] font-medium border border-line">
                Type: {typeFilter}
                <button onClick={() => setTypeFilter('ALL')} className="text-slate-400 hover:text-ink font-bold">×</button>
              </span>
            )}
            {minScore > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-paper-alt text-slate-700 font-mono text-[11px] font-medium border border-line">
                Min Fit: {minScore}%
                <button onClick={() => setMinScore(0)} className="text-slate-400 hover:text-ink font-bold">×</button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="font-mono text-[11px] font-bold text-brand-700 hover:text-brand-900 ml-auto transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </Card>

      {/* Jobs Grid (Solid white surfaces with 1px border for legibility) */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No vacancies match your criteria"
          description="Try broadening your search keywords or resetting your active filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="border-line hover:border-slate-300 hover:shadow-card-hover hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4 bg-white"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-ink leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  {/* Status pill with dot */}
                  <div className="shrink-0">
                    {job.hasApplied ? (
                      <StatusBadge status="APPLIED" size="sm" />
                    ) : (
                      <StatusBadge status={job.status || 'OPEN'} size="sm" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="font-mono text-ink bg-paper-alt px-2.5 py-1 rounded-[4px] border border-line flex items-center gap-1 font-bold">
                    <IndianRupee className="w-3 h-3 text-slate-500" />
                    {job.salaryRange}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Deadline: {job.deadline}
                  </span>
                </div>

                {/* Match score bar (if authenticated) */}
                {isAuthenticated && (
                  <div className="p-2.5 rounded-[8px] bg-paper-alt border border-line">
                    <MatchScoreBar score={job.matchedScore} policyVersion="v1.0-80/20" size="sm" />
                  </div>
                )}

                {/* Reference Skill tags as small pill chips */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                      Required:
                    </span>
                    {job.requiredSkills.map((req) => (
                      <span key={req.skillId} className="skill-tag-chip">
                        {req.canonicalName}
                      </span>
                    ))}
                  </div>

                  {job.preferredSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                        Preferred:
                      </span>
                      {job.preferredSkills.map((pref) => (
                        <span key={pref.skillId} className="skill-tag-chip border-brand-200 text-brand-800 bg-brand-50/50">
                          {pref.canonicalName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="pt-3 border-t border-line flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenerateResumeForJob(job.id)}
                  className="text-xs text-brand-700 hover:text-brand-900 font-mono font-bold gap-1.5 px-2"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Generate Resume</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetail(job)}
                  className="gap-1 font-mono font-bold text-xs"
                >
                  <span>Review Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApply={handleApply}
        isApplying={isApplying}
      />
    </div>
  );
};
