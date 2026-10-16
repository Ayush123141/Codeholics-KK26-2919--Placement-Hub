import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Home, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-bold text-base text-slate-900">ProofHire</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-700 font-mono text-sm font-bold border border-slate-200">
            404
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Page Not Found
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The requested placement record or page route does not exist or may have been archived.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </Button>
            <Link to="/student" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Student Hub</span>
              </Button>
            </Link>
            <Link to="/vacancies" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-slate-600"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Vacancies</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        ProofHire Placement Hub • TechSummit Institute of Technology
      </footer>
    </div>
  );
};
