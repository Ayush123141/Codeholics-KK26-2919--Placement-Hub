import React, { useState, useEffect } from 'react';
import { 
  CopyCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Building2, 
  User, 
  Calendar, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { placementApi } from '@/lib/api/placementApi';
import { JobSource } from '@/types';

export const JobIngestionDedupe: React.FC = () => {
  const { showToast } = useToast();
  const [sources, setSources] = useState<JobSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<JobSource | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadSources() {
      const data = await placementApi.getJobSources();
      setSources(data);
    }
    loadSources();
  }, []);

  const handleOpenCompare = (source: JobSource) => {
    setSelectedSource(source);
    setIsCompareOpen(true);
  };

  const handleResolveDuplicate = async (sourceId: string, decision: 'APPROVED_MERGE' | 'REJECTED_SEPARATE') => {
    setIsProcessing(true);
    try {
      const updated = await placementApi.resolveDuplicate(sourceId, decision);
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, ...updated } : s))
      );
      showToast(
        decision === 'APPROVED_MERGE'
          ? 'Duplicate confirmed. Source merged into canonical job while preserving full provenance.'
          : 'Duplicate rejected. Record retained as distinct opening.',
        'success'
      );
      setIsCompareOpen(false);
    } catch {
      showToast('Failed to resolve duplicate decision', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingWarnings = sources.filter((s) => s.duplicateWarning && s.resolutionStatus === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Job Ingestion & Duplicate Resolution
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Openings arrive via company postings, alumni referrals, and API adapters. The backend flags candidate duplicates for officer review while preserving source history.
        </p>
      </div>

      {/* Duplicate Warning Callout */}
      {pendingWarnings.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {pendingWarnings.length} Potential Duplicate Openings Detected
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Backend deduplication detected overlapping role titles, company names, and canonical URLs. Review before candidate matching.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="md">
            Requires Human Review
          </Badge>
        </div>
      )}

      {/* Sources Table / Cards */}
      <div className="space-y-4">
        {sources.map((src) => {
          const typeBadge = {
            COMPANY_POSTING: <Badge variant="info">Company Direct Posting</Badge>,
            ALUMNI_REFERRAL: <Badge variant="purple">Alumni Referral</Badge>,
            API_INGESTION: <Badge variant="slate">National Placement API</Badge>,
          }[src.sourceType];

          return (
            <Card
              key={src.id}
              className={`space-y-3 transition-all ${
                src.duplicateWarning ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {typeBadge}
                  <span className="text-xs font-bold text-slate-900">{src.sourceName}</span>
                </div>
                {src.resolutionStatus === 'APPROVED_MERGE' && (
                  <Badge variant="success">Merged with Canonical Job</Badge>
                )}
                {src.resolutionStatus === 'REJECTED_SEPARATE' && (
                  <Badge variant="slate">Kept as Separate Opening</Badge>
                )}
                {src.resolutionStatus === 'PENDING' && src.duplicateWarning && (
                  <Badge variant="warning">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Duplicate Warning ({src.duplicateConfidence}% Match)
                  </Badge>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <span>
                    Submitted by: <strong>{src.submittedBy}</strong>
                  </span>
                  <span>Timestamp: {src.submittedAt}</span>
                  {src.externalId && <span>External ID: {src.externalId}</span>}
                </div>

                {src.duplicateWarning && (
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Candidate Duplicate:</p>
                      <p className="text-[11px] text-amber-800">{src.duplicateCandidateTitle}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCompare(src)}
                      className="border-amber-300 text-amber-900 hover:bg-amber-100"
                    >
                      Compare Records
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Canonical Job ID: {src.jobId}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                  >
                    <span>Inspect Source Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Duplicate Comparison Modal */}
      {selectedSource && (
        <Modal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          title="Review Job Duplicate Suggestion"
          description={`Incoming Source: ${selectedSource.sourceName} • Confidence: ${selectedSource.duplicateConfidence}%`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                The backend detected high lexical and skill similarity. Approving merges this referral/API source with the canonical job while maintaining provenance in <code>job_sources</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Existing Canonical Record */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Canonical Record</span>
                <h4 className="text-sm font-bold text-slate-900">
                  Frontend Platform Engineer — CloudScale Technologies
                </h4>
                <p className="text-slate-600">
                  Primary company submission via recruiter portal. Linked to active placement campaign.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="default" size="sm">React</Badge>
                  <Badge variant="default" size="sm">TypeScript</Badge>
                </div>
              </div>

              {/* Incoming Duplicate Candidate */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-700">Incoming Record</span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedSource.duplicateCandidateTitle}
                </h4>
                <p className="text-slate-600">
                  Submitted by {selectedSource.submittedBy} at {selectedSource.submittedAt}.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="default" size="sm">ReactJS</Badge>
                  <Badge variant="default" size="sm">TypeScript</Badge>
                </div>
              </div>
            </div>

            {/* Decision Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleResolveDuplicate(selectedSource.id, 'REJECTED_SEPARATE')}
                isLoading={isProcessing}
                className="gap-1.5 text-slate-700"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Keep as Separate Opening</span>
              </Button>

              <Button
                variant="primary"
                onClick={() => handleResolveDuplicate(selectedSource.id, 'APPROVED_MERGE')}
                isLoading={isProcessing}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Merge & Link Source</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
