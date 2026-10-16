import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'An unexpected network error occurred while communicating with the service. Please check your connection and retry.',
  onRetry,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/40 my-4',
      className
    )}>
      <div className="p-3 bg-rose-100 rounded-xl text-rose-600 mb-3 border border-rose-200">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700/90 max-w-md mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-100/50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  );
};
