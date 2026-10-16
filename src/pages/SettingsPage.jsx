import React, { useState } from 'react';
import {
  User,
  Shield,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Link,
  Award,
  Lock,
  Globe
} from 'lucide-react';

export default function SettingsPage({ profile, onResetDemoData, onShowToast }) {
  const [gitHubSynced, setGitHubSynced] = useState(true);
  const [lmsSynced, setLmsSynced] = useState(true);
  const [assessmentProctored, setAssessmentProctored] = useState(true);

  const handleSyncToggle = (type) => {
    onShowToast({
      type: 'info',
      title: 'Evidence Sync Updated',
      message: `${type} integration settings refreshed.`
    });
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* Settings Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900">Platform & Evidence Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your verified student profile, linked code repositories, and evidence integrations.
        </p>
      </div>

      {/* Student Profile Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-slate-900">Candidate Identity & Degree Record</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              readOnly
              value={profile.name}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              Campus Institutional Email
            </label>
            <input
              type="text"
              readOnly
              value={profile.email}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              College & Degree Program
            </label>
            <input
              type="text"
              readOnly
              value={`${profile.college} — ${profile.degree}`}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              Graduation Year & CGPA
            </label>
            <input
              type="text"
              readOnly
              value={`${profile.graduationYear} (CGPA: ${profile.gpa})`}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Evidence Source Integrations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Evidence Ingestion Pipelines</h3>
        </div>

        <div className="space-y-3">
          {/* GitHub */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">GitHub Permitted Repository Audit</p>
                <p className="text-[11px] text-slate-500">Connected as @alexmorgan-dev (18 repositories indexed)</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected & Audited
            </span>
          </div>

          {/* Campus LMS */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Campus LMS Coursework & Proctored Tests</p>
                <p className="text-[11px] text-slate-500">Verified academic transcript and lab submissions</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          </div>

          {/* HackerRank / LeetCode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Standardized Algorithmic Sandbox</p>
                <p className="text-[11px] text-slate-500">20/20 DSA benchmark tests verified with proctor token</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Demo State Management</h3>
        <p className="text-xs text-slate-500">
          Reset all locally applied jobs, custom evidence submissions, and simulated pipeline moves back to the initial hackathon state.
        </p>
        <button
          onClick={onResetDemoData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo State</span>
        </button>
      </div>
    </div>
  );
}
