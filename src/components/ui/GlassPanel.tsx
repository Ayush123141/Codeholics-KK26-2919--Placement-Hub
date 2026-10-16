import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'strong';
  borderStyle?: 'subtle' | 'white' | 'none';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  intensity = 'medium',
  borderStyle = 'white',
  ...props
}) => {
  const intensityMap = {
    light: 'bg-white/60 backdrop-blur-sm',
    medium: 'bg-white/75 backdrop-blur-md',
    strong: 'bg-white/88 backdrop-blur-lg',
  };

  const borderMap = {
    white: 'border border-white/60',
    subtle: 'border border-slate-200/60',
    none: 'border-0',
  };

  return (
    <div
      className={cn(
        'rounded-[14px] shadow-glass transition-all text-ink',
        intensityMap[intensity],
        borderMap[borderStyle],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
