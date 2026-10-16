import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Briefcase,
  FileText,
  FileCheck2,
  Send,
  Building2,
  CopyCheck,
  Award,
  Users2,
  CalendarDays,
  X,
  Target,
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
    { label: 'Overview', path: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Candidate Profile', path: '/student/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Evidence & Skills', path: '/student/evidence', icon: <ShieldCheck className="w-4 h-4" />, badge: '3 Verified' },
    { label: 'Explore Vacancies', path: '/student/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Resume Studio', path: '/student/resume-studio', icon: <FileText className="w-4 h-4" /> },
    { label: 'Resume Claim Review', path: '/student/claim-review', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'My Applications', path: '/student/applications', icon: <Send className="w-4 h-4" />, badge: 'Active' },
  ];

  const placementNav: NavItem[] = [
    { label: 'Placement Dashboard', path: '/placement', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Hiring Campaigns', path: '/placement/campaigns', icon: <Target className="w-4 h-4" /> },
    { label: 'Job Sources & Dedupe', path: '/placement/job-ingestion', icon: <CopyCheck className="w-4 h-4" />, badge: '2 Warnings' },
    { label: 'Student Evidence Registry', path: '/placement/student-evidence', icon: <Award className="w-4 h-4" /> },
    { label: 'Batch Ranking & Shortlist', path: '/placement/batch-ranking', icon: <Users2 className="w-4 h-4" />, badge: 'PS6 Core' },
    { label: 'Application Pipeline', path: '/placement/applications', icon: <Send className="w-4 h-4" /> },
  ];

  const companyNav: NavItem[] = [
    { label: 'Recruiter Dashboard', path: '/company', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Job Vacancies', path: '/company/vacancies', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Shared Shortlist', path: '/company/candidates', icon: <Users2 className="w-4 h-4" />, badge: 'Verified' },
    { label: 'Interviews & Offers', path: '/company/pipeline', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  const items = role === 'STUDENT' ? studentNav : role === 'PLACEMENT_OFFICER' ? placementNav : companyNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-16 z-40 h-full lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Mobile close button & title */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-800 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {role.replace('_', ' ')} Navigation
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section label */}
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {role === 'STUDENT'
              ? 'Candidate Workspace'
              : role === 'PLACEMENT_OFFICER'
              ? 'Institute Placement Cell'
              : 'Hiring Partner Workspace'}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 mt-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/student' || item.path === '/placement' || item.path === '/company'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-brand-300 border border-slate-700/60 group-hover:border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-200">PS6 Evidence Policy</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              Matching is deterministic (80% required + 20% preferred). AI never fabricates scores.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
