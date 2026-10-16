import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const LoginSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-sm mb-2">
          <ShieldCheck className="w-7 h-7 text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ProofHire — Placement Hub
        </h1>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          Evidence-backed campus hiring, verified skills matching, and transparent placement governance.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="max-w-3xl w-full mx-auto my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Portal Card */}
        <Card className="p-8 flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition-all group border-slate-200">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Portal</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Access your profile, discover suitable vacancies, manage your resume, and track applications.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verifiable skill evidence & proctored benchmarks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Job-description-specific ATS resume studio</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Automated resume claim verification</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
            <Button
              className="w-full gap-2 font-semibold"
              onClick={() => navigate('/login/student')}
            >
              <span>Continue as Student</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <Link to="/register" className="text-xs text-brand-600 hover:text-brand-800 font-medium">
                New candidate? Register with resume →
              </Link>
            </div>
          </div>
        </Card>

        {/* Placement Officer Card */}
        <Card className="p-8 flex flex-col justify-between hover:border-slate-800 hover:shadow-md transition-all group border-slate-200">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Placement Officer Portal</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Manage placement campaigns, review student progress, and coordinate recruitment activities.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span>Job ingestion across 3 sources with deduplication</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span>Deterministic batch candidate ranking (80/20)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span>Controlled shortlist & evidence sharing</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
            <Button
              variant="secondary"
              className="w-full gap-2 font-semibold"
              onClick={() => navigate('/login/placement')}
            >
              <span>Continue as Placement Officer</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="text-center text-xs text-slate-400">
              Requires institutional staff authorization
            </div>
          </div>
        </Card>
      </div>

      {/* Guest Exploration Option */}
      <div className="max-w-md mx-auto text-center space-y-2">
        <Link
          to="/vacancies"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
        >
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>Explore active vacancies without logging in</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <p className="text-[11px] text-slate-400">
          TechSummitTrainers Placement Hub • PS6 Architecture
        </p>
      </div>
    </div>
  );
};
