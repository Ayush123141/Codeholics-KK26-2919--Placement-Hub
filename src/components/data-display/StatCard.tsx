import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'brand' | 'emerald' | 'amber' | 'violet' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'brand',
  className,
}) => {
  const iconColors = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    emerald: 'bg-fresh/10 text-emerald-800 border-emerald-300',
    amber: 'bg-brand-50 text-brand-700 border-brand-200',
    violet: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-paper-alt text-slate-700 border-line',
  };

  return (
    <Card className={cn('p-5 border-line hover:border-slate-300 transition-all shadow-card bg-white', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="font-display text-2xl font-bold text-ink mt-1 tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'font-mono text-[11px] font-bold',
                  trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[10px] text-slate-400">vs last cycle</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-[10px] border shadow-xs', iconColors[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
