import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Send,
  ShieldCheck,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, unreadAlertsCount = 2 }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'find-jobs', label: 'Find Jobs', icon: Briefcase, badge: '24' },
    { id: 'applications', label: 'My Applications', icon: Send, badge: '6' },
    { id: 'evidence', label: 'Skill Evidence', icon: ShieldCheck, highlight: true },
    { id: 'resume', label: 'Resume Studio', icon: FileText },
    { id: 'placement', label: 'Placement Insights', icon: BarChart3, badge: 'Officer' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0c111d] text-slate-300 border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-400 shadow-lg shadow-violet-600/30 text-white font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c111d]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">Proof<span className="text-violet-400">Hire</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">AI</span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium leading-none">Evidence-First Placement</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline micro banner */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-950/60 to-slate-900 border border-violet-800/30 text-[11px] text-violet-200/90 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span className="leading-tight font-medium">"Don't Just Claim Skills. <strong className="text-white">Prove Them.</strong>"</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Student Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-700/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Officer'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Evidence Verification Status Pill */}
        <div className="p-3 mx-3 mb-3 bg-slate-900/90 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Ratio
            </span>
            <span className="text-[11px] font-bold text-emerald-400">80%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full w-4/5" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            12 of 15 skills backed by repository or test audit.
          </p>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Alex Morgan"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/50"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c111d]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">Alex Morgan</p>
                <span className="text-[9px] font-semibold bg-violet-500/20 text-violet-300 px-1 py-0.2 rounded border border-violet-500/30">
                  Student
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 truncate">alex.morgan@campus.edu</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
