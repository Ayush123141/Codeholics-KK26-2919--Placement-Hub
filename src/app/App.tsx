import React from 'react';
import { AppProviders } from './providers';
import { AppRouter } from './router';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
};
