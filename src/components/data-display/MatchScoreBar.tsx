import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface MatchScoreBarProps {
  score?: number;
  policyVersion?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const MatchScoreBar: React.FC<MatchScoreBarProps> = ({
  score,
  policyVersion,
  size = 'md',
  showLabel = true,
  className,
}) => {
  if (score === undefined || score === null) {
    return (
      <span className="text-xs text-slate-400 italic">
        Matching not yet available
      </span>
    );
  }

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-700 bg-emerald-500';
    if (val >= 60) return 'text-brand-700 bg-brand-500';
    if (val >= 40) return 'text-amber-700 bg-amber-500';
    return 'text-rose-700 bg-rose-500';
  };

  const getTrackColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-100';
    if (val >= 60) return 'bg-brand-100';
    if (val >= 40) return 'bg-amber-100';
    return 'bg-rose-100';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Fit Score: <span className="font-extrabold">{score}%</span>
          </span>
          {policyVersion && (
            <span className="text-[10px] text-slate-400 font-mono">
              Policy: {policyVersion}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', heights[size], getTrackColor(score))}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreColor(score).split(' ')[1])}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};
