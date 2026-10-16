import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function ApplicationsPage({ applications, onUpdateStatus, onNavigate }) {
  const [selectedStage, setSelectedStage] = useState('All');

  const stages = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer'];

  const filteredApps =
    selectedStage === 'All'
      ? applications
      : applications.filter((app) => app.status === selectedStage);

  const getStageCounts = () => {
    return {
      Applied: applications.filter((a) => a.status === 'Applied').length,
      Shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      Interview: applications.filter((a) => a.status === 'Interview').length,
      Offer: applications.filter((a) => a.status === 'Offer').length,
    };
  };

  const counts = getStageCounts();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Interview':
        return 'bg-violet-100 text-violet-800 border-violet-300 font-bold';
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
      case 'Applied':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Recruitment Tracker
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              {applications.length} Active Candidateships
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Application Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently track which evidence-backed resumes were reviewed, shortlisted, or scheduled for interviews.
          </p>
        </div>

        {/* Quick stat chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('resume')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>View Verified Resume</span>
          </button>
        </div>
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'Applied', label: '1. Applied', count: counts.Applied, desc: 'Under automated filter review', color: 'border-slate-300 bg-slate-50 text-slate-800' },
          { id: 'Shortlisted', label: '2. Shortlisted', count: counts.Shortlisted, desc: 'Evidence threshold met (>80%)', color: 'border-blue-200 bg-blue-50/60 text-blue-800' },
          { id: 'Interview', label: '3. Interview', count: counts.Interview, desc: 'Technical & HR rounds scheduled', color: 'border-violet-200 bg-violet-50/60 text-violet-800' },
          { id: 'Offer', label: '4. Offer', count: counts.Offer, desc: 'Pre-placement offer generated', color: 'border-emerald-200 bg-emerald-50/60 text-emerald-800' },
        ].map((col) => (
          <div
            key={col.id}
            onClick={() => setSelectedStage(selectedStage === col.id ? 'All' : col.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedStage === col.id
                ? 'ring-2 ring-violet-600 shadow-md'
                : 'hover:shadow-sm'
            } ${col.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{col.label}</span>
              <span className="text-lg font-black">{col.count}</span>
            </div>
            <p className="text-[10.5px] opacity-75 mt-1.5 font-medium">{col.desc}</p>
          </div>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {selectedStage === 'All' ? 'All Applications' : `${selectedStage} Stage Applications`} ({filteredApps.length})
          </h3>
          <span className="text-xs text-slate-400">
            Tip: You can simulate stage updates below for your demo presentation.
          </span>
        </div>

        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${app.logoColor} flex items-center justify-center text-white font-extrabold text-base shadow-md flex-shrink-0`}>
                {app.logo}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{app.company}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] border ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="text-[10px] bg-violet-50 text-violet-700 font-bold px-2 py-0.5 rounded-full border border-violet-200">
                    {app.matchScore}% Proof Match
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{app.role}</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Applied on {app.appliedDate}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {app.verifiedSkillsCount} Verified Skills Attached
                  </span>
                </div>
                {/* Next Step & Notes */}
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-800">
                    <strong className="text-violet-700">Next Step:</strong> {app.nextStep}
                  </p>
                  {app.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      "{app.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Stage Switcher for Hackathon Demo */}
            <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Simulate Status
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['Applied', 'Shortlisted', 'Interview', 'Offer'].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => onUpdateStatus(app.id, stage)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      app.status === stage
                        ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
