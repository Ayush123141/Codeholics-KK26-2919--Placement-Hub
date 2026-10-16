import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-mono font-bold rounded-[10px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] min-h-[36px] sm:min-h-0';

    const variants = {
      // Primary button: Reference .btn-amber
      primary: 'bg-brand-500 text-ink hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-btn-amber focus-visible:ring-brand-500 border border-brand-600/20',
      // Secondary button: Reference dark button
      secondary: 'bg-ink text-white hover:bg-ink-2 hover:-translate-y-0.5 focus-visible:ring-ink shadow-xs border border-ink-3',
      // Outline button: Reference .btn-outline
      outline: 'border-[1.5px] border-slate-300 bg-transparent text-ink hover:bg-ink hover:text-white hover:border-ink hover:-translate-y-0.5 focus-visible:ring-slate-400',
      // Ghost button
      ghost: 'text-slate-600 hover:text-ink hover:bg-slate-100/80 focus-visible:ring-slate-400',
      // Danger button
      danger: 'bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-0.5 focus-visible:ring-rose-600 shadow-xs',
      // Success button: Reference .fresh
      success: 'bg-fresh text-ink hover:bg-emerald-400 hover:-translate-y-0.5 focus-visible:ring-fresh shadow-xs',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-xs sm:text-[13px] px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-sm px-6 py-3 gap-2.5 min-h-[46px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
