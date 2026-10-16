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
  | 'CLOSED' 
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
    // Evidence Statuses
    case 'VERIFIED':
      label = label || 'Verified';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;

    case 'REVIEWED':
      label = label || 'Reviewed';
      icon = <Clock className="w-3 h-3 text-blue-600 shrink-0" />;
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      break;

    case 'NEEDS_REVIEW':
      label = label || 'Needs Review';
      icon = <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />;
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;

    case 'UNVERIFIED':
      label = label || 'Unverified Claim';
      icon = <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;

    case 'NO_EVIDENCE':
    case 'NO EVIDENCE RECORDED':
      label = label || 'No Evidence Recorded';
      icon = <ShieldAlert className="w-3 h-3 text-slate-500 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;

    // Application Stages
    case 'APPLIED':
      label = label || 'Applied';
      icon = <Briefcase className="w-3 h-3 text-blue-600 shrink-0" />;
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      break;

    case 'SHORTLISTED':
      label = label || 'Shortlisted';
      icon = <UserCheck className="w-3 h-3 text-purple-600 shrink-0" />;
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
      break;

    case 'TECHNICAL_ASSESSMENT':
      label = label || 'Assessment Phase';
      icon = <Clock className="w-3 h-3 text-amber-600 shrink-0" />;
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;

    case 'INTERVIEW':
      label = label || 'Interview Scheduled';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;

    case 'OFFER':
      label = label || 'Offer Extended';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />;
      colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      break;

    case 'REJECTED':
      label = label || 'Not Selected';
      icon = <XCircle className="w-3 h-3 text-rose-600 shrink-0" />;
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      break;

    // Claim Review Statuses
    case 'SUPPORTED':
      label = label || 'Evidence Supported';
      icon = <FileCheck2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;

    case 'CONTRADICTED':
      label = label || 'Contradicted by Record';
      icon = <XCircle className="w-3 h-3 text-rose-600 shrink-0" />;
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      break;

    // Vacancy Statuses
    case 'ACTIVE':
      label = label || 'Active Vacancy';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />;
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;

    case 'CLOSED':
      label = label || 'Closed';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;

    case 'DRAFT':
      label = label || 'Draft';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />;
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;

    // Dedupe Resolution
    case 'APPROVED_MERGE':
      label = label || 'Merged with Provenance';
      icon = <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />;
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      break;

    case 'REJECTED_SEPARATE':
      label = label || 'Distinct Opening';
      icon = <CheckCircle2 className="w-3 h-3 text-slate-600 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;

    case 'PENDING':
      label = label || 'Pending Review';
      icon = <Clock className="w-3 h-3 text-amber-600 shrink-0" />;
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;

    default:
      label = label || normalized.replace(/_/g, ' ');
      icon = <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />;
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-0.5 font-semibold gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none',
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
