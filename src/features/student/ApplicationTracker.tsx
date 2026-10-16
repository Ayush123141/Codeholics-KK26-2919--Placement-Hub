import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  User,
  History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { studentApi } from '@/lib/api/studentApi';
import { Application, ApplicationStage, ApplicationEvent } from '@/types';

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  useEffect(() => {
    async function loadApps() {
      const data = await studentApi.getApplications();
      setApplications(data);
    }
    loadApps();
  }, []);



  const handleOpenTimeline = (app: Application) => {
    setSelectedApp(app);
    setIsTimelineOpen(true);
  };

  const stagesOrder: ApplicationStage[] = [
    'APPLIED',
    'SHORTLISTED',
    'TECHNICAL_ASSESSMENT',
    'INTERVIEW',
    'OFFER',
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Application Tracking & History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your candidacies across active hiring campaigns with auditable, timestamped pipeline updates.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="Explore active job vacancies and submit an evidence-backed application."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
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
                      <span className="font-semibold text-brand-700">Fit: {app.fitScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.currentStage} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTimeline(app)}
                      className="gap-1 font-semibold"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit Trail</span>
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
                                ? 'bg-brand-600 text-white ring-4 ring-brand-100'
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
                              isCurrent ? 'text-brand-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
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
                {app.interviewDate && (
                  <div className="p-3.5 bg-brand-50/60 rounded-xl border border-brand-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <div>
                        <p className="font-bold text-slate-900">
                          Interview Scheduled: {app.interviewDate}
                        </p>
                        {app.interviewNotes && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{app.interviewNotes}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="purple">Round 1 Confirmed</Badge>
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
              {selectedApp.events.map((ev, idx) => (
                <div key={ev.id} className="relative group">
                  {/* Dot */}
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
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
              Application state changes and stage transitions are strictly governed by authorized institutional placement officers.
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
