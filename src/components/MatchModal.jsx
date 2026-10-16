import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Bookmark,
  Building2,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function MatchModal({
  job,
  onClose,
  onApply,
  onBookmark,
  isBookmarked,
  isApplied
}) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${job.logoColor} flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-2 ring-white/10`}>
              {job.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">{job.company}</span>
                <span className="text-[10px] bg-white/10 text-slate-200 px-2 py-0.5 rounded-full">{job.type}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{job.stipend}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Explainability Match Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100/80">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg text-white shadow-md shadow-violet-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Explainable AI Match Breakdown</h4>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-extrabold shadow-sm">
                    {job.matchScore}% Compatibility
                  </div>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                  {job.matchReason}
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-violet-200/50 text-[11px] text-violet-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  <span>Verified Evidence Attached: {job.evidenceSummary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matched Skills vs Skill Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Match Requirements ({job.matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.matchedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {sk}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-emerald-700 mt-3 font-medium">
                ✓ Proven through code commits and proctored testing benchmarks.
              </p>
            </div>

            {/* Skill Gaps */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Identified Skill Gaps ({job.missingSkills?.length || 1})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(job.missingSkills || [job.gap]).map((gap) => (
                  <span
                    key={gap}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {gap}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-amber-700 mt-3 font-medium">
                Tip: Submit a verified TypeScript GitHub repository to raise your match to 98%.
              </p>
            </div>
          </div>

          {/* Job Overview & Requirements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role Overview</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {job.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role Requirements</h4>
            <ul className="space-y-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => onBookmark(job.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isBookmarked
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-violet-600 text-violet-600' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save Job'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApply(job.id);
                onClose();
              }}
              disabled={isApplied}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                isApplied
                  ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-600/30'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isApplied ? 'Application Submitted' : 'Apply with Truthful Resume'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
