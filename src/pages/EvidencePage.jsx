import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  ExternalLink,
  Code2,
  FolderGit2,
  FileCheck2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export default function EvidencePage({ skills, onOpenAddEvidence }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Verified', 'Evidence found', 'Needs review', 'Unverified'];

  const filteredSkills =
    activeFilter === 'All'
      ? skills
      : skills.filter((s) => s.status.toLowerCase() === activeFilter.toLowerCase());

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'Evidence found':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Evidence found
          </span>
        );
      case 'Needs review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Needs review
          </span>
        );
      case 'Unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            Unverified
          </span>
        );
    }
  };

  const getEvidenceTypeIcon = (type) => {
    if (type.includes('Assessment')) return <FileCheck2 className="w-4 h-4 text-violet-600" />;
    if (type.includes('Repo') || type.includes('GitHub')) return <FolderGit2 className="w-4 h-4 text-blue-600" />;
    return <Code2 className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Title and "Add Evidence" CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c111d] text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2 border border-violet-500/30">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>ProofHire Core Engine • Verified Evidence Vault</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">Skill Evidence & Proof Matrix</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Unsubstantiated resume claims lead to mis-hires and rejected applications. ProofHire connects every claimed competence to auditable source code, proctored test results, or live projects.
          </p>
        </div>

        <button
          onClick={onOpenAddEvidence}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/30 transition-all transform active:scale-95 whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Evidence</span>
        </button>
      </div>

      {/* Disclaimers & Methodology Banner */}
      <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200/80 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-violet-950 font-bold">Evidence Review Methodology:</strong> Repository commits, test pass rates, and proctored coding assessments support the structured review of a candidate's skill claim. ProofHire highlights verified proof while flagging unverified claims so recruiters and students can align transparently.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((fil) => (
          <button
            key={fil}
            onClick={() => setActiveFilter(fil)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === fil
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {fil} {fil === 'All' ? `(${skills.length})` : ''}
          </button>
        ))}
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow"
          >
            <div>
              {/* Header: Skill Name, Category, Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{item.skill}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      {getEvidenceTypeIcon(item.evidenceType)}
                      {item.evidenceType}
                    </span>
                    <span>• Added {item.dateAdded}</span>
                  </div>
                </div>

                <div>{getStatusBadge(item.status)}</div>
              </div>

              {/* Source & Details */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Source Artifact
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{item.sourceName}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verification Method
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{item.verificationMethod}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Proof Audit Details
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{item.details}</p>
                </div>
              </div>

              {/* Artifact Chips */}
              {item.artifacts && item.artifacts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.artifacts.map((art, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200"
                    >
                      <ExternalLink className="w-3 h-3 text-violet-500" />
                      {art}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Score & Progress footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Verification Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      item.evidenceScore >= 85
                        ? 'bg-emerald-500'
                        : item.evidenceScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${item.evidenceScore}%` }}
                  />
                </div>
                <span className="font-extrabold text-slate-800">{item.evidenceScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
