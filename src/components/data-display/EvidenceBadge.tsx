import React from 'react';
import { CheckCircle2, Clock, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EvidenceStatus } from '@/types';

export interface EvidenceBadgeProps {
  status: EvidenceStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <Badge variant="fresh" size={size} className={className}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-fresh" />}
          <span>Verified</span>
        </Badge>
      );
    case 'REVIEWED':
      return (
        <Badge variant="default" size={size} className={className}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-slate-600" />}
          <span>Reviewed</span>
        </Badge>
      );
    case 'NEEDS_REVIEW':
      return (
        <Badge variant="warning" size={size} className={className}>
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-brand-600" />}
          <span>Needs Review</span>
        </Badge>
      );
    case 'UNVERIFIED':
      return (
        <Badge variant="amber" size={size} className={className}>
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
          <span>Unverified</span>
        </Badge>
      );
    case 'NO_EVIDENCE':
    default:
      return (
        <Badge variant="default" size={size} className={className}>
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />}
          <span>No Evidence Recorded</span>
        </Badge>
      );
  }
};
