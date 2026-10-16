import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';

export const LoginSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-paper-alt flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft background radial wash */}
      <div 
        className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 163, 0, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center space-y-3 relative z-10">
        <Link to="/" className="inline-flex items-center justify-center gap-2 group mb-2">
          <div className="w-11 h-11 rounded-[10px] bg-brand-500 text-ink flex items-center justify-center shadow-btn-amber group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-display font-extrabold text-2xl text-ink">
            Proof<span className="text-brand-600">Hire</span>
          </span>
        </Link>
        <span className="eyebrow !mb-0 text-center">Institutional Verification Hub</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Select Your Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Evidence-backed campus hiring, verified skills matching, and transparent placement governance.
        </p>
      </div>

      {/* Role Selection Cards (Restrained Glass Panels over soft wash) */}
      <div className="max-w-3xl w-full mx-auto my-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Student Portal Card */}
        <GlassPanel className="p-8 flex flex-col justify-between hover:border-brand-500 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group bg-white/80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-[10px] bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Candidate Account
              </span>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-ink">Student Portal</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Review verified skill evidence, inspect deterministic vacancy fit scores, and build job-tailored ATS resumes.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-line font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-fresh shrink-0" />
                <span>Verifiable repository & project ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-fresh shrink-0" />
                <span>Deterministic 80/20 criteria matching</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-fresh shrink-0" />
                <span>Custom tailored resume export</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-line space-y-2.5">
            <Button
              variant="primary"
              className="w-full gap-2 font-bold shadow-btn-amber"
              onClick={() => navigate('/login/student')}
            >
              <span>Continue as Student</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <Link to="/register" className="font-mono text-xs text-brand-700 hover:text-brand-900 font-semibold transition-colors">
                New candidate? Register with resume →
              </Link>
            </div>
          </div>
        </GlassPanel>

        {/* Placement Officer Card */}
        <GlassPanel className="p-8 flex flex-col justify-between hover:border-ink hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group bg-white/80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-[10px] bg-ink text-white flex items-center justify-center border border-ink-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-brand-400" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Institutional Staff
              </span>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-ink">Placement Officer Hub</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Coordinate campus recruitment drives, review job feed deduplications, and verify student evidence ledgers.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-line font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                <span>Job ingestion across 3 feeds with fuzzy dedupe</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                <span>Batch candidate ranking by verified skills</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                <span>Immutable verification audit timestamps</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-line space-y-2.5">
            <Button
              variant="secondary"
              className="w-full gap-2 font-bold"
              onClick={() => navigate('/login/placement')}
            >
              <span>Continue as Placement Officer</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="text-center font-mono text-[11px] text-slate-400">
              Requires institutional staff authorization
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Guest Exploration Option */}
      <div className="max-w-md mx-auto text-center space-y-2 relative z-10">
        <Link
          to="/vacancies"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-ink font-semibold transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>Explore active vacancies without logging in</span>
          <ArrowRight className="w-3 h-3 text-brand-600" />
        </Link>
        <p className="font-mono text-[11px] text-slate-400">
          TechSummitTrainers Placement Hub • Evidence-Backed Campus Hiring
        </p>
      </div>
    </div>
  );
};
