import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Briefcase,
  FileText,
  Send,
  Building2,
  CopyCheck,
  Award,
  Users2,
  X,
  Target,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const studentNav: NavItem[] = [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Explore Vacancies', path: '/student/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'My Profile', path: '/student/profile', icon: <User className="w-4 h-4" /> },
    { label: 'My Evidence', path: '/student/evidence', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Skill Assessments', path: '/student/assessments', icon: <ClipboardCheck className="w-4 h-4" />, badge: 'Proctored' },
    { label: 'My Resume Studio', path: '/student/resume-studio', icon: <FileText className="w-4 h-4" /> },
    { label: 'Applications', path: '/student/applications', icon: <Send className="w-4 h-4" /> },
  ];

  const placementNav: NavItem[] = [
    { label: 'Placement Dashboard', path: '/placement', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Hiring Campaigns', path: '/placement/campaigns', icon: <Target className="w-4 h-4" /> },
    { label: 'Job Sources & Dedupe', path: '/placement/job-ingestion', icon: <CopyCheck className="w-4 h-4" /> },
    { label: 'Cohort Evidence Registry', path: '/placement/student-evidence', icon: <Award className="w-4 h-4" /> },
    { label: 'Batch Ranking & Shortlist', path: '/placement/batch-ranking', icon: <Users2 className="w-4 h-4" />, badge: 'Core Demo' },
    { label: 'Application Pipeline', path: '/placement/applications', icon: <Send className="w-4 h-4" /> },
  ];

  const items = role === 'STUDENT' ? studentNav : placementNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Solid Sidebar Container (No glass in app shell) */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-16 z-40 h-full lg:h-[calc(100vh-4rem)] w-60 bg-white border-r border-line flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Mobile close button & title */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-line lg:hidden">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              {role.replace('_', ' ')} Navigation
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section label */}
          <div className="px-2 py-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {role === 'STUDENT'
              ? 'Candidate Workspace'
              : 'Placement Operations'}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 mt-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/student' || item.path === '/placement'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border-l-2 border-brand-500 shadow-xs'
                      : 'text-slate-600 hover:text-ink hover:bg-paper-alt'
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0 text-slate-400 group-hover:text-ink transition-colors">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-paper-alt text-slate-600 border border-line">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info box with solid surface */}
        <div className="p-4 border-t border-line bg-paper-alt">
          <p className="font-display text-[11px] font-bold text-ink">ProofHire Ledger</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-sans">
            Deterministic matching (80/20). Verified evidence, truthful resumes.
          </p>
        </div>
      </aside>
    </>
  );
};
