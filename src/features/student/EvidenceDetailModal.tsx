import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  FileCode, 
  Calendar, 
  UserCheck, 
  Info,
  Award
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
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" size="sm">
                Type: {evidence.type}
              </Badge>
              {evidence.score && (
                <Badge variant="purple" size="sm">
                  Score: {evidence.score}
                </Badge>
              )}
            </div>
          </div>
          <EvidenceBadge status={evidence.status} size="md" />
        </div>

        {/* Detailed explanatory record */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-brand-600" />
            <span>Evaluation & Verification Details</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
            {evidence.details}
          </p>
        </div>

        {/* Verification Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Verifier / Evaluator</span>
            </div>
            <p className="font-bold text-slate-800">{evidence.verifier || 'Automated Analysis Engine'}</p>
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
              <span>Inspected Source File Evidence</span>
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
              <span>Inspect Source Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
