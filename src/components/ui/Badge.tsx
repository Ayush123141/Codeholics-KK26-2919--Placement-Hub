import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'slate' | 'amber' | 'fresh' | 'tag';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-brand-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    slate: 'bg-ink text-white border-ink-3',
    amber: 'bg-brand-50 text-brand-700 border-brand-200',
    fresh: 'bg-fresh/10 text-emerald-800 border-emerald-300',
    // Reference tech/skill tag chip style
    tag: 'bg-paper-alt text-slate-600 border-slate-200 rounded font-mono',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const isTag = variant === 'tag';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border transition-colors',
        isTag ? 'rounded' : 'rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
