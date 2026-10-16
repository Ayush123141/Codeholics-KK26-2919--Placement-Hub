import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  ShieldCheck,
  Plus,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function TopNav({
  activeTab,
  setMobileOpen,
  onOpenAddEvidence,
  searchQuery,
  setSearchQuery,
  notifications = []
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const titles = {
    overview: { title: 'Dashboard Overview', breadcrumb: 'ProofHire / Overview' },
    'find-jobs': { title: 'Explore Matched Jobs', breadcrumb: 'ProofHire / Jobs & Matching' },
    applications: { title: 'Application Pipeline', breadcrumb: 'ProofHire / My Applications' },
    evidence: { title: 'Skill Evidence Vault', breadcrumb: 'ProofHire / Verified Evidence' },
    resume: { title: 'Truthful Resume Studio', breadcrumb: 'ProofHire / ATS Resume Studio' },
    placement: { title: 'Placement Officer Insights', breadcrumb: 'ProofHire / Recruiter & Officer View' },
    settings: { title: 'Platform Settings', breadcrumb: 'ProofHire / Account & Integrations' }
  };

  const current = titles[activeTab] || { title: 'Dashboard', breadcrumb: 'ProofHire' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/90 no-print">
      {/* Left section: mobile toggle & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wide text-slate-600 uppercase">
              {current.breadcrumb}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center relative max-w-xs lg:max-w-md w-full mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs, skills, or evidence proof..."
          className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border border-transparent focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
        />
        <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Demo Data indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>DEMO DATA</span>
        </div>

        {/* Add Evidence quick CTA */}
        <button
          onClick={onOpenAddEvidence}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-violet-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Evidence</span>
        </button>

        {/* Notification toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600" />
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] bg-violet-50 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                  2 unread
                </span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-lg bg-violet-50/60 border border-violet-100 text-xs">
                  <p className="font-semibold text-slate-800">TechNova Match Alert</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Your verified React assessment unlocked a 94% match for Frontend Intern.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                  <p className="font-semibold text-slate-800">Evidence Verified</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    TaskFlow SaaS repository commit audit completed and verified.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-1 text-center text-[11px] font-semibold text-violet-600 hover:text-violet-700 hover:bg-slate-50 rounded"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Alex Morgan"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">Alex Morgan</p>
            <span className="text-[10px] font-medium text-violet-600">Student • NIT 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
}
