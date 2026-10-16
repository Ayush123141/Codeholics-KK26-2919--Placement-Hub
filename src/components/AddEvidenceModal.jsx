import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  UploadCloud,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function AddEvidenceModal({ isOpen, onClose, onAddEvidence }) {
  const [skill, setSkill] = useState('TypeScript');
  const [category, setCategory] = useState('Programming Language');
  const [evidenceType, setEvidenceType] = useState('GitHub Repository');
  const [sourceName, setSourceName] = useState('');
  const [artifactUrl, setArtifactUrl] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!skill || !sourceName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddEvidence({
        skill,
        category,
        status: 'Evidence found',
        evidenceScore: 88,
        evidenceType,
        sourceName,
        dateAdded: 'Just now',
        verificationMethod: 'Automated Repository Audit & Static Analysis',
        details: details || `Verified ${evidenceType} artifact with code parsing and structural evidence.`,
        artifacts: [artifactUrl || `github.com/alexmorgan/${skill.toLowerCase().replace(/[^a-z0-9]/g, '')}-demo`]
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c111d] text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">Add Skill Evidence</h3>
              <p className="text-[11px] text-slate-400 mt-1">Back your resume claims with verifiable code or test proof</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Skill to Verify
            </label>
            <select
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value);
                if (e.target.value === 'TypeScript') setCategory('Programming Language');
                else if (e.target.value === 'Docker') setCategory('DevOps & Tools');
                else if (e.target.value === 'PostgreSQL Optimization') setCategory('Databases');
                else if (e.target.value === 'System Design') setCategory('Computer Science');
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <option value="TypeScript">TypeScript (Currently Unverified)</option>
              <option value="PostgreSQL Optimization">PostgreSQL Optimization (Skill Gap)</option>
              <option value="Docker & Containers">Docker & Containers (Currently Unverified)</option>
              <option value="System Design">System Design Fundamentals (Skill Gap)</option>
              <option value="Python Data Science">Python Data Science (Needs Review)</option>
              <option value="Custom Skill">Other / Custom Technical Skill</option>
            </select>
          </div>

          {/* Evidence Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Evidence Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'GitHub Repository', icon: FileCode2, label: 'GitHub Repository' },
                { id: 'Proctored Assessment', icon: ShieldCheck, label: 'Proctored Assessment' },
                { id: 'Live Web Project', icon: Sparkles, label: 'Live Deployed App' },
                { id: 'Academic Coursework', icon: UploadCloud, label: 'Academic Lab / Project' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setEvidenceType(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                    evidenceType === item.id
                      ? 'border-violet-600 bg-violet-50 text-violet-800 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${evidenceType === item.id ? 'text-violet-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source / Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Project or Assessment Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TypeSafe E-Commerce Client or HackerRank TS Gold"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
            />
          </div>

          {/* Artifact Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Repository URL or Verification Link
            </label>
            <input
              type="text"
              placeholder="https://github.com/alexmorgan/typescript-showcase"
              value={artifactUrl}
              onChange={(e) => setArtifactUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
            />
          </div>

          {/* Details / Outcomes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Proof Summary & Measurable Work
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 100% strict type coverage, generics, Zod schema validation, 12 passing test suites."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none"
            />
          </div>

          {/* Demo Workflow Disclaimer Note */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Evidence-Review Workflow:</strong> Submitted artifacts support review of skill claims. Code commits and test assertions enter our automated audit pipeline.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-md shadow-violet-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Auditing Artifact...' : 'Submit Evidence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
