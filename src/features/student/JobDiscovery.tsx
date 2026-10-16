import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { JobDetailModal } from './JobDetailModal';
import { useToast } from '@/components/ui/Toast';
import { studentApi } from '@/lib/api/studentApi';
import { Job } from '@/types';

export const JobDiscovery: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    async function loadJobs() {
      const data = await studentApi.getJobs();
      setJobs(data);
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((s) => s.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || job.type === typeFilter;
    const matchesScore = (job.matchedScore || 0) >= minScore;
    return matchesSearch && matchesType && matchesScore;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Explore Placement Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse active campus openings with explainable fit scores matching your recorded evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Deterministic Policy v1.0
          </Badge>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, or skill..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              Min Fit Score: {minScore}%
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs matched your filters"
          description="Try broadening your search keywords or lowering the minimum fit score."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setTypeFilter('ALL');
            setMinScore(0);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
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
                  <Badge variant={job.hasApplied ? 'success' : 'slate'} size="sm">
                    {job.hasApplied ? 'Applied' : job.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 pt-1">
                  <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100 flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    {job.salaryRange}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Deadline: {job.deadline}
                  </span>
                </div>

                {/* Match score bar */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MatchScoreBar score={job.matchedScore} policyVersion="v1.0" size="sm" />
                </div>

                {/* Skills tags */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                      Required:
                    </span>
                    {job.requiredSkills.map((req) => (
                      <Badge key={req.skillId} variant="default" size="sm">
                        {req.canonicalName}
                      </Badge>
                    ))}
                  </div>

                  {job.preferredSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                        Preferred:
                      </span>
                      {job.preferredSkills.map((pref) => (
                        <Badge key={pref.skillId} variant="purple" size="sm">
                          {pref.canonicalName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {job.sourceCount} verified source listing{job.sourceCount > 1 ? 's' : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetail(job)}
                  className="gap-1.5 font-bold"
                >
                  <span>Review Match & Details</span>
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
