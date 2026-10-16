import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

export default function ResumeStudioPage({ profile, skills, onShowToast }) {
  const [showEvidencePills, setShowEvidencePills] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ATS Modern Clean');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onShowToast({
        type: 'success',
        title: 'Resume Re-Generated',
        message: 'All bullet points cross-referenced against your verified code evidence matrix.'
      });
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar (Hidden when printing) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Truthful Resume Engine
              </span>
              <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full">
                ATS-Optimized
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Truthful Resume Studio</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every skill and experience bullet links directly to verifiable evidence artifacts.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowEvidencePills(!showEvidencePills)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                showEvidencePills
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showEvidencePills ? 'Hide Evidence Badges' : 'Show Evidence Badges'}</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Cross-Auditing...' : 'Re-Audit Resume'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-600/30 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>

        {/* Mandatory Truthful Resume Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-violet-50/80 border border-violet-200 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-violet-950 font-bold">ProofHire Integrity Commitment: </strong>
            "Your resume is designed to reflect supported skills and real project evidence. Review every claim before exporting."
            ProofHire does not fabricate experience or exaggerate unverified achievements.
          </div>
        </div>
      </div>

      {/* Printable ATS Resume Paper */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-300 shadow-xl p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <header className="border-b-2 border-slate-900 pb-5 mb-5 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
            {profile.name}
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mt-1">
            Aspiring Software Engineer & Full-Stack Developer • Batch 2026
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs text-slate-500 font-medium">
            <span>{profile.email}</span>
            <span>•</span>
            <span>linkedin.com/in/alexmorgan-dev</span>
            <span>•</span>
            <span>github.com/alexmorgan-dev</span>
            <span>•</span>
            <span>alexmorgan.dev</span>
          </div>
        </header>

        {/* Education Section */}
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Education
          </h2>
          <div className="flex justify-between items-start text-xs">
            <div>
              <p className="font-bold text-slate-900">{profile.college}</p>
              <p className="text-slate-600">{profile.degree}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">Expected May 2026</p>
              <p className="text-slate-600">CGPA: {profile.gpa}</p>
            </div>
          </div>
        </section>

        {/* Technical Skills with Evidence Badges */}
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Verified Technical Skills
          </h2>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 min-w-[120px]">Frontend:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-700">React.js, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS</span>
                {showEvidencePills && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Verified (2 Projects + 94% SkillCheck)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 min-w-[120px]">Backend & APIs:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-700">Node.js, Express, REST APIs, JSON Web Tokens</span>
                {showEvidencePills && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded border border-blue-300">
                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                    Evidence Found (TaskFlow API - 145 Commits)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 min-w-[120px]">Databases:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-700">PostgreSQL, MySQL, Schema Normalization</span>
                {showEvidencePills && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300">
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                    Review Needed (Academic Schema Only)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 min-w-[120px]">Tools & DevOps:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-700">Git, GitHub Actions CI/CD, Vite, Postman, Linux</span>
                {showEvidencePills && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Verified (312 Annual Commits)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 min-w-[120px]">Pending Verification:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-500 line-through">TypeScript</span>
                {showEvidencePills && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-300">
                    <AlertTriangle className="w-2.5 h-2.5 text-slate-500" />
                    Unverified Claim (Evidence Required Before Final Export)
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Verified Technical Projects */}
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Verified Projects & Evidence
          </h2>

          <div className="space-y-3 text-xs">
            {/* Project 1 */}
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">E-Commerce Web Platform</span>
                  <span className="text-[10px] text-slate-500">React, Context API, Tailwind, LocalStorage</span>
                  {showEvidencePills && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Proof: GitHub Repo + Lighthouse 98
                    </span>
                  )}
                </div>
                <span className="text-slate-500 font-medium">Aug 2026 – Oct 2026</span>
              </div>
              <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 leading-relaxed">
                <li>Architected responsive product catalog featuring debounced search and multi-facet filtering across 200+ mock SKUs.</li>
                <li>Implemented reusable UI component library achieving 100% WCAG accessibility compliance verified by automated DOM audit.</li>
                <li>Integrated cart state persistence with client-side caching to prevent state desynchronization.</li>
              </ul>
            </div>

            {/* Project 2 */}
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">TaskFlow SaaS Micro-API</span>
                  <span className="text-[10px] text-slate-500">Node.js, Express, Jest, JWT</span>
                  {showEvidencePills && (
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Proof: 145 Commits + 24 Unit Tests
                    </span>
                  )}
                </div>
                <span className="text-slate-500 font-medium">May 2026 – Jul 2026</span>
              </div>
              <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 leading-relaxed">
                <li>Built modular RESTful microservice with role-based access control (Admin, Member, Viewer) using signed JWTs.</li>
                <li>Implemented in-memory rate limiting middleware handling up to 100 requests per minute per IP address.</li>
                <li>Authored 24 comprehensive Jest integration test suites covering authenticated user workflows and failure edge cases.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Proctored Assessments & Certifications */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Proctored Assessments & Verified Benchmarks
          </h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Proctored React SkillCheck v2</strong> — Scored 94/100 (Top 5th percentile)
                {showEvidencePills && (
                  <span className="ml-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Proctored ID #REC-94821
                  </span>
                )}
              </div>
              <span className="text-slate-500">Oct 2026</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Campus Algorithmic Problem Solving</strong> — Scored 92/100 (20/20 Test Cases Passed)
                {showEvidencePills && (
                  <span className="ml-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Proctored ID #DSA-JAVA-92
                  </span>
                )}
              </div>
              <span className="text-slate-500">Jul 2026</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
