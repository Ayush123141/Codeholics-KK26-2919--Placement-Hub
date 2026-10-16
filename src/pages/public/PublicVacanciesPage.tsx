import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { JobDiscovery } from '@/features/student/JobDiscovery';

export const PublicVacanciesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper-alt flex flex-col font-sans text-ink">
      <Header />
      <main className="flex-1 max-w-site mx-auto w-full p-4 sm:p-6 lg:p-8">
        <JobDiscovery />
      </main>
      <footer className="border-t border-line bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-site mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <p>© 2026 ProofHire Placement Hub • TechSummit Institute of Technology</p>
          <div className="flex items-center gap-3 text-slate-400">
            <Link to="/" className="hover:text-ink transition-colors">Home</Link>
            <span>•</span>
            <Link to="/login/student" className="hover:text-ink transition-colors">Candidate Sign In</Link>
            <span>•</span>
            <Link to="/login/placement" className="hover:text-ink transition-colors">Officer Hub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
