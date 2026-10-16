import React from 'react';
import { Header } from '@/components/layout/Header';
import { JobDiscovery } from '@/features/student/JobDiscovery';

export const PublicVacanciesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <JobDiscovery />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        ProofHire Placement Hub • TechSummit Institute of Technology • Evidence-Backed Campus Hiring
      </footer>
    </div>
  );
};
