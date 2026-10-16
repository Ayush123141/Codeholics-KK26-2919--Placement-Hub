import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  ShieldAlert, 
  XCircle, 
  FileCheck2, 
  UserCheck, 
  Briefcase 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { EvidenceStatus, ApplicationStage, ClaimReviewStatus } from '@/types';

export type UnifiedStatus = 
  | EvidenceStatus 
  | ApplicationStage 
  | ClaimReviewStatus 
  | 'ACTIVE' 
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSED' 
  | 'EXPIRED'
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED_MERGE'
  | 'REJECTED_SEPARATE'
  | string;

export interface StatusBadgeProps {
  status: UnifiedStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
  customLabel,
}) => {
  const normalized = status ? status.toUpperCase() : 'NO_EVIDENCE';

  let label = customLabel;
  let icon: React.ReactNode = null;
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (normalized) {
    // Vacancy Statuses (with dot indicator matching reference)
    case 'OPEN':
    case 'ACTIVE':
      label = label || 'Open';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-fresh shrink-0" />;
      colorClasses = 'bg-fresh/10 text-emerald-900 border-emerald-300';
      break;

    case 'CLOSING_SOON':
      label = label || 'Closing Soon';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />;
      colorClasses = 'bg-brand-50 text-brand-800 border-brand-200';
      break;

    case 'CLOSED':
      label = label || 'Closed';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;

    case 'EXPIRED':
      label = label || 'Expired';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />;
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      break;

    // Evidence Statuses
    case 'VERIFIED':
      label = label || 'Verified';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-fresh shrink-0" />;
      colorClasses = 'bg-fresh/10 text-emerald-900 border-emerald-300';
      break;

    case 'REVIEWED':
      label = label || 'Reviewed';
      icon = <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
      break;

    case 'NEEDS_REVIEW':
      label = label || 'Needs Review';
      icon = <AlertCircle className="w-3.5 h-3.5 text-brand-600 shrink-0" />;
      colorClasses = 'bg-brand-50 text-brand-800 border-brand-200';
      break;

    case 'UNVERIFIED':
      label = label || 'Unverified Claim';
      icon = <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;

    case 'NO_EVIDENCE':
    case 'NO EVIDENCE RECORDED':
      label = label || 'No Evidence Recorded';
      icon = <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;

    // Application Stages
    case 'APPLIED':
      label = label || 'Applied';
      icon = <Briefcase className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
      break;

    case 'SHORTLISTED':
      label = label || 'Shortlisted';
      icon = <UserCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />;
      colorClasses = 'bg-brand-50 text-brand-900 border-brand-200';
      break;

    case 'TECHNICAL_ASSESSMENT':
      label = label || 'Assessment Phase';
      icon = <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />;
      colorClasses = 'bg-brand-50 text-brand-800 border-brand-200';
      break;

    case 'INTERVIEW':
      label = label || 'Interview Scheduled';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-fresh shrink-0" />;
      colorClasses = 'bg-fresh/10 text-emerald-900 border-emerald-300';
      break;

    case 'OFFER':
      label = label || 'Offer Extended';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-fresh shrink-0" />;
      colorClasses = 'bg-fresh/15 text-emerald-950 border-emerald-400';
      break;

    case 'REJECTED':
      label = label || 'Not Selected';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      break;

    // Claim Review Statuses
    case 'SUPPORTED':
      label = label || 'Evidence Supported';
      icon = <FileCheck2 className="w-3.5 h-3.5 text-fresh shrink-0" />;
      colorClasses = 'bg-fresh/10 text-emerald-900 border-emerald-300';
      break;

    case 'CONTRADICTED':
      label = label || 'Contradicted by Record';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      break;

    case 'DRAFT':
      label = label || 'Draft';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;

    // Dedupe Resolution
    case 'APPROVED_MERGE':
      label = label || 'Merged with Provenance';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;

    case 'REJECTED_SEPARATE':
      label = label || 'Distinct Opening';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;

    case 'PENDING':
      label = label || 'Pending Review';
      icon = <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />;
      colorClasses = 'bg-brand-50 text-brand-800 border-brand-200';
      break;

    default:
      label = label || normalized.replace(/_/g, ' ');
      icon = <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-0.5 font-semibold gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none font-mono tracking-tight',
        colorClasses,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
