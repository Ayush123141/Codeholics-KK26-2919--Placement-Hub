import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  History,
  Search,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Trash2,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { studentApi } from '@/lib/api/studentApi';
import { Application, ApplicationStage } from '@/types';

export const ApplicationTracker: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    async function loadApps() {
      setIsLoading(true);
      try {
        const data = await studentApi.getApplications();
        setApplications(data);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadApps();
  }, []);

  const handleOpenTimeline = (app: Application) => {
    setSelectedApp(app);
    setIsTimelineOpen(true);
  };

  const handleWithdraw = async (app: Application) => {
    const confirmed = window.confirm(
      `Are you sure you want to withdraw your application for "${app.jobTitle}" at ${app.companyName}?`
    );
    if (!confirmed) return;

    setIsWithdrawing(app.id);
    try {
      await studentApi.withdrawApplication(app.id);
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      showToast(`Application for ${app.jobTitle} has been withdrawn`, 'info');
    } catch {
      showToast('Failed to withdraw application', 'error');
    } finally {
      setIsWithdrawing(null);
    }
  };

  const stagesOrder: ApplicationStage[] = [
    'APPLIED',
    'SHORTLISTED',
    'TECHNICAL_ASSESSMENT',
    'INTERVIEW',
    'OFFER',
  ];

  // Dynamic filter stats
  const totalCount = applications.length;
  const shortlistedCount = applications.filter(
    (a) => a.currentStage === 'SHORTLISTED' || a.currentStage === 'TECHNICAL_ASSESSMENT'
  ).length;
  const interviewCount = applications.filter((a) => a.currentStage === 'INTERVIEW').length;
  const offersCount = applications.filter((a) => a.currentStage === 'OFFER').length;

  const tabs = [
    { id: 'ALL', label: 'All Candidacies', count: totalCount },
    { id: 'SHORTLISTED', label: 'Shortlisted', count: shortlistedCount },
    { id: 'INTERVIEW', label: 'Interviews', count: interviewCount },
    { id: 'OFFER', label: 'Offers', count: offersCount },
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'SHORTLISTED' &&
        (app.currentStage === 'SHORTLISTED' || app.currentStage === 'TECHNICAL_ASSESSMENT')) ||
      app.currentStage === activeTab;

    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.currentStage.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application Tracking & Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status updates, live candidate progression, and verifiable audit ledgers across your applications.
          </p>
        </div>
        <Button onClick={() => navigate('/student/jobs')} className="gap-1.5 self-start sm:self-auto">
          <Briefcase className="w-4 h-4" />
          <span>Explore More Vacancies</span>
        </Button>
      </div>

      {/* Dynamic Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Applied</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold">
            <span>Shortlisted</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{shortlistedCount}</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
            <span>In Interview</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{interviewCount}</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold">
            <span>Job Offers</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{offersCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidacies by role, company name, or status..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Applications List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your applications...</div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title={applications.length === 0 ? 'No applications submitted yet' : 'No matching applications found'}
          description={
            applications.length === 0
              ? 'Browse open vacancies from verified hiring partners and submit your first evidence-linked application.'
              : 'Try clearing your search query or switching tabs.'
          }
          actionLabel="Explore Open Vacancies"
          onAction={() => navigate('/student/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const currentStageIndex = stagesOrder.indexOf(app.currentStage);

            return (
              <Card key={app.id} className="space-y-4 hover:border-slate-300 transition-all">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{app.jobTitle}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.companyName}
                      </span>
                      <span>•</span>
                      <span>Applied: {app.appliedAt}</span>
                      <span>•</span>
                      <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                        Match Score: {app.fitScore}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.currentStage} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTimeline(app)}
                      className="gap-1 font-semibold text-xs"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit Trail</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWithdraw(app)}
                      isLoading={isWithdrawing === app.id}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs px-2"
                      title="Withdraw application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Pipeline Progression Stepper */}
                <div className="pt-2 pb-1">
                  <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

                    {stagesOrder.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={stage} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-xs'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            {isCompleted && !isCurrent ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold mt-1.5 hidden sm:block ${
                              isCurrent
                                ? 'text-brand-700'
                                : isCompleted
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interview Callout if present */}
                {(app.interviewDate || app.currentStage === 'INTERVIEW') && (
                  <div className="p-3.5 bg-brand-50/70 rounded-xl border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {app.interviewDate ? `Interview Scheduled: ${app.interviewDate}` : 'Interview Stage Active — Coordinator will connect'}
                        </p>
                        {app.interviewNotes && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{app.interviewNotes}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="purple">Technical Round</Badge>
                  </div>
                )}

                {/* Job Offer Callout if Offered */}
                {app.currentStage === 'OFFER' && (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Official Placement Offer Extended by {app.companyName}!</span>
                    </div>
                    <Badge variant="success">Offer Letter Ready</Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Timeline Modal */}
      {selectedApp && (
        <Modal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          title="Application Event History & Audit Log"
          description={`Application ID: ${selectedApp.id} • ${selectedApp.jobTitle} at ${selectedApp.companyName}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
              {selectedApp.events && selectedApp.events.length > 0 ? (
                selectedApp.events.map((ev) => (
                  <div key={ev.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-white" />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {ev.toStage.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{ev.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-600">{ev.notes}</p>

                      <p className="text-[10px] text-slate-400">
                        Logged by <strong>{ev.actorName}</strong> ({ev.actorRole.replace('_', ' ')})
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No events recorded yet.</div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Application stage transitions are verified through cryptographic event logs managed by authorized placement officers.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsTimelineOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
