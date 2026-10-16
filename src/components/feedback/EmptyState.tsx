import React from 'react';
import { FolderSearch, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 my-4">
      <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-slate-200 mb-4 text-slate-400">
        {icon || <FolderSearch className="w-8 h-8 text-slate-400" />}
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected network error occurred while communicating with the service.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/40 my-4">
      <div className="p-3 bg-rose-100 rounded-xl text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700/90 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-100/50">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
};
