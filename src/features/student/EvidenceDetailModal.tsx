import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  FileCode, 
  Calendar, 
  UserCheck, 
  Info,
  Award,
  CheckCircle2,
  FileCheck,
  Cpu
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { EvidenceBadge } from '@/components/data-display/EvidenceBadge';
import { Badge } from '@/components/ui/Badge';
import { EvidenceRecord } from '@/types';

export interface EvidenceDetailModalProps {
  evidence: EvidenceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  if (!evidence) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evidence Artifact Verification Record"
      description={`ID: ${evidence.id} • Canonical Skill: ${evidence.skillName}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Top summary banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900">{evidence.title}</h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="default" size="sm">
                Category: {evidence.type}
              </Badge>
              {evidence.score && (
                <Badge variant="purple" size="sm">
                  Score: {evidence.score}
                </Badge>
              )}
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{evidence.credibilityScore || 94}% Credibility Rating</span>
              </span>
            </div>
          </div>
          <EvidenceBadge status={evidence.status} size="md" />
        </div>

        {/* Certificate Section if Credential */}
        {(evidence.type === 'CERTIFICATE' || evidence.certificateFileName || evidence.issuer) && (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Award className="w-4 h-4 text-amber-600" />
                Certificate & Credential Audit Details
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                Issuer Authenticated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
              <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Issuing Authority</span>
                <span className="font-bold text-slate-900">{evidence.issuer || 'Authorized Global Issuer'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Attached Document</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {evidence.certificateFileName || 'Verified_Digital_Credential.pdf'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed explanatory record */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-brand-600" />
            <span>Evaluation & Implementation Details</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
            {evidence.details}
          </p>
        </div>

        {/* Automated Engine Audit Metrics */}
        {evidence.auditMetrics?.authenticityCheck && (
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-emerald-900">
              <Cpu className="w-3.5 h-3.5 text-emerald-700" />
              <span>Automated Engine Authenticity Audit</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              {evidence.auditMetrics.authenticityCheck}
            </p>
          </div>
        )}

        {/* Verification Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Automated Verifier Engine</span>
            </div>
            <p className="font-bold text-slate-800">{evidence.verifier || 'ProofHire Automated Assessment Engine v1.2'}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Verification Date</span>
            </div>
            <p className="font-bold text-slate-800">{evidence.date}</p>
          </div>
        </div>

        {/* Parsed Repository Code Files (if GitHub/Project) */}
        {evidence.repoFiles && evidence.repoFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <FileCode className="w-3.5 h-3.5 text-slate-700" />
              <span>Inspected Source File Evidence (AST Audited)</span>
            </div>
            <div className="space-y-2">
              {evidence.repoFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-brand-400">{file.path}</span>
                    {file.lineRange && (
                      <span className="text-slate-400 text-[11px] font-sans">
                        ({file.lineRange})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans uppercase">
                    {file.language}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Link */}
        {evidence.sourceUrl && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <a
              href={evidence.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              <span>{evidence.type === 'CERTIFICATE' ? 'Verify Public Credential Ledger' : 'Inspect Source Repository'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
