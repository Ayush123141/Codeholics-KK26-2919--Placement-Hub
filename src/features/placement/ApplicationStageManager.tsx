import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Building2, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  User, 
  History,
  FileCheck2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { studentApi } from '@/lib/api/studentApi';
import { placementApi } from '@/lib/api/placementApi';
import { Application, ApplicationStage } from '@/types';

export const ApplicationStageManager: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Update form fields
  const [targetStage, setTargetStage] = useState<ApplicationStage>('SHORTLISTED');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadApps() {
      const data = await placementApi.getApplications();
      setApplications(data);
    }
    loadApps();
  }, []);

  const handleOpenUpdate = (app: Application) => {
    setSelectedApp(app);
    setTargetStage(app.currentStage);
    setNotes('');
    setIsUpdateOpen(true);
  };

  const handleOpenTimeline = (app: Application) => {
    setSelectedApp(app);
    setIsTimelineOpen(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdating(true);
    try {
      const updated = await placementApi.updateApplicationStage(
        selectedApp.id,
        targetStage,
        notes || undefined,
        selectedApp
      );

      try {
        const fresh = await placementApi.getApplications();
        if (fresh && fresh.length > 0) {
          setApplications(fresh);
        } else {
          setApplications((prev) =>
            prev.map((a) => (a.id === selectedApp.id ? updated : a))
          );
        }
      } catch {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? updated : a))
        );
      }

      showToast(`Application for ${selectedApp.studentName} transitioned to ${targetStage.replace('_', ' ')}`, 'success');
      setIsUpdateOpen(false);
    } catch {
      showToast('Failed to update application stage', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Application Pipeline Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Authorized placement officer interface to advance application stages and log auditable transition notes.
        </p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="space-y-3 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {app.studentName} — {app.jobTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700">{app.companyName}</span>
                  <span>•</span>
                  <span>Applied: {app.appliedAt}</span>
                  <span>•</span>
                  <span className="font-semibold text-brand-700">Fit Score: {app.fitScore}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={app.currentStage} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenTimeline(app)}
                  className="font-semibold"
                >
                  <History className="w-3.5 h-3.5 mr-1" />
                  Audit Trail
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleOpenUpdate(app)}
                  className="font-semibold"
                >
                  Update Stage
                </Button>
              </div>
            </div>

            {app.interviewDate && (
              <div className="p-3 bg-brand-50/60 rounded-lg border border-brand-200/80 text-xs text-brand-900">
                <span className="font-bold">Interview Scheduled: </span>
                <span>{app.interviewDate} ({app.interviewNotes})</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Update Stage Modal */}
      {selectedApp && (
        <Modal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          title={`Update Application Stage: ${selectedApp.studentName}`}
          description={`Job: ${selectedApp.jobTitle} • Current Stage: ${selectedApp.currentStage}`}
          size="md"
        >
          <form onSubmit={handleSaveStage} className="space-y-4">
            <Select
              label="Transition to Stage"
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value as ApplicationStage)}
            >
              <option value="APPLIED">Applied (Preliminary Review)</option>
              <option value="SHORTLISTED">Shortlisted (Approved by Officer)</option>
              <option value="TECHNICAL_ASSESSMENT">Technical Assessment</option>
              <option value="INTERVIEW">Interview Round</option>
              <option value="OFFER">Offer Extended</option>
              <option value="REJECTED">Not Selected</option>
            </Select>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Audit Log Reason / Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="e.g. Fast-tracked based on 94% proctored React benchmark..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
              Every transition is recorded permanently in <code>application_events</code> with your officer credentials and timestamp.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setIsUpdateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                Commit Stage Update
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Timeline Modal */}
      {selectedApp && (
        <Modal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          title="Application Event History & Audit Log"
          description={`Application ID: ${selectedApp.id} • ${selectedApp.studentName} for ${selectedApp.jobTitle}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
              {selectedApp.events.map((ev) => (
                <div key={ev.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-white" />
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.toStage.replace('_', ' ')}</span>
                      <span className="text-slate-400 text-[10px]">{ev.timestamp}</span>
                    </div>
                    <p className="text-slate-600">{ev.notes}</p>
                    <p className="text-[10px] text-slate-400">
                      Logged by <strong>{ev.actorName}</strong> ({ev.actorRole})
                    </p>
                  </div>
                </div>
              ))}
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
