import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  FileCheck2, 
  Building2, 
  Briefcase, 
  Layers, 
  Lock, 
  FileText, 
  ChevronRight,
  Terminal,
  Award,
  GraduationCap,
  Sparkles,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GlassPanel } from '@/components/ui/GlassPanel';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // FAQ open/close states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-white text-ink flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900 pb-14 sm:pb-0">
      {/* 1. RESTRICTED GLASS STICKY NAVBAR */}
      <nav aria-label="Main" className="glass-nav fixed top-0 w-full z-50 transition-all duration-200">
        <div className="max-w-site mx-auto px-4 sm:px-6 h-[66px] flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="ProofHire Home">
            <div className="w-9 h-9 rounded-[10px] bg-brand-500 flex items-center justify-center text-ink shadow-xs transition-transform duration-150 group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-ink stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base tracking-tight text-ink flex items-center gap-1">
                Proof<span className="text-brand-600">Hire</span>
              </span>
              <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500 font-semibold">
                Evidence Hub
              </span>
            </div>
          </Link>

          {/* Desktop Anchor Links */}
          <div className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
            <a href="#for-students" className="hover:text-ink transition-colors">For students</a>
            <a href="#for-officers" className="hover:text-ink transition-colors">For placement officers</a>
            <a href="#principles" className="hover:text-ink transition-colors">Principles</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
            <Link to="/vacancies" className="hover:text-brand-700 transition-colors flex items-center gap-1">
              Vacancies
              <span className="w-1.5 h-1.5 rounded-full bg-fresh"></span>
            </Link>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/login/placement"
              className="hidden sm:inline-block text-xs font-semibold text-slate-500 hover:text-ink transition-colors"
            >
              Officer Login
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login/student')}
              className="hidden sm:inline-flex text-xs py-2"
            >
              Student Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              className="text-xs py-2 px-4 shadow-btn-amber"
            >
              Get Started →
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-white border-b border-line">
        {/* Subtle grid background pattern and warm soft radial gradient */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 20, 32, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 20, 32, 0.05) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at 60% 40%, black 0%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 60% 40%, black 0%, transparent 75%)',
          }}
        />
        <div 
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245, 163, 0, 0.12) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-site mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Reference-style Announcement Portal Banner */}
              <Link
                to="/vacancies"
                className="inline-flex items-center gap-3.5 px-4 py-2 rounded-full bg-ink text-text-on-dark border border-brand-500/30 shadow-sm hover:border-brand-500 hover:shadow-md transition-all duration-200 group"
              >
                <span className="w-2 h-2 rounded-full bg-brand-500 relative flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75"></span>
                </span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                  Live Campus Drive
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Verified vacancies open for 2026 batch
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-ink leading-[1.12]">
                Don't just claim your skills.{' '}
                <span className="text-brand-600 underline decoration-brand-300 decoration-wavy underline-offset-8">
                  Prove them.
                </span>
              </h1>

              {/* Plain-Language Subtitle */}
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                ProofHire replaces inflated resumes with an audited, evidence-backed matching hub.
                Every skill claim is backed by real repository commits, accredited coursework, or peer-reviewed assessments — eliminating guesswork for placement officers and employers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/register')}
                  className="font-bold text-xs sm:text-sm px-6 shadow-btn-amber"
                >
                  Register as a student →
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/vacancies')}
                  className="font-semibold text-xs sm:text-sm px-6"
                >
                  Browse vacancies
                </Button>
              </div>

              {/* Quiet Row of 4 Factual Stats (Restrained Glass Strip) */}
              <div className="pt-8 border-t border-line">
                <p className="font-mono text-[11px] uppercase tracking-wider text-brand-700 font-semibold mb-4">
                  Deterministic System Guarantees
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-lg sm:text-xl text-ink">
                      Evidence-backed
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Skills mapped to verified repositories
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-lg sm:text-xl text-ink">
                      Explainable 80/20
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Mathematical match scoring policy
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-lg sm:text-xl text-ink">
                      Job-specific
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Targeted ATS resumes per vacancy
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-lg sm:text-xl text-ink">
                      Audited ledger
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Zero unverified claims counted as fact
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Restrained Glass Interactive Preview Card */}
            <div className="lg:col-span-5">
              <GlassPanel className="p-6 sm:p-7 border border-white/70 shadow-glass">
                <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-fresh"></div>
                    <span className="font-mono text-xs text-slate-500 ml-2 font-medium">ledger-preview.ts</span>
                  </div>
                  <Badge variant="fresh" size="sm">
                    ● Audit Passed
                  </Badge>
                </div>

                {/* Candidate Proof Card Sample */}
                <div className="bg-white rounded-lg p-4 border border-line space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-ink">
                        Alex Morgan
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        B.Tech CS • 2026 Batch
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-lg text-brand-600 leading-none block">
                        92%
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        Evidence Match
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-mono text-[11px]">React + TypeScript:</span>
                      <span className="text-emerald-700 font-mono text-[11px] font-semibold bg-fresh/10 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Verified Repo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-mono text-[11px]">Node.js Microservices:</span>
                      <span className="text-blue-700 font-mono text-[11px] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ● Reviewed Assessment
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-mono text-[11px]">PostgreSQL Sharding:</span>
                      <span className="text-amber-800 font-mono text-[11px] font-semibold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        ? Unverified Claim
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 bg-paper-alt p-2.5 rounded border border-line">
                    <p className="font-medium text-slate-700">Audit Rule Applied:</p>
                    <p className="mt-0.5">
                      Unverified claim is visibly flagged. No penalization, but no false qualification credits given.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-center">
                  <Link
                    to="/vacancies"
                    className="font-mono text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1.5 transition-colors"
                  >
                    View candidate-job matching in action →
                  </Link>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SECTION: HOW IT WORKS (4 STEPS) */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-paper-alt border-b border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow">How ProofHire Works</span>
            <h2 className="sec-title">Four steps to authentic placement verification.</h2>
            <p className="sec-lede mx-auto">
              A transparent protocol connecting student skill evidence directly to accredited hiring decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="flex flex-col justify-between border-slate-200/90 shadow-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-mono font-bold text-base">
                  01
                </div>
                <h3 className="font-display font-bold text-base text-ink">
                  Profile & Resume Import
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your existing resume. ProofHire extracts structured skills and project claims with complete candidate review rights — nothing is locked in until you confirm it.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <span className="skill-tag-chip">
                  Candidate Data Rights
                </span>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="flex flex-col justify-between border-slate-200/90 shadow-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-mono font-bold text-base">
                  02
                </div>
                <h3 className="font-display font-bold text-base text-ink">
                  Attach Verifiable Evidence
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Link public GitHub repos, live production links, faculty attestations, or campus project credits. Missing evidence is never punished — it's simply flagged clearly.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <span className="skill-tag-chip">
                  Evidence Ledger
                </span>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="flex flex-col justify-between border-slate-200/90 shadow-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-mono font-bold text-base">
                  03
                </div>
                <h3 className="font-display font-bold text-base text-ink">
                  Matched Vacancy Discovery
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Explore approved campus openings with a transparent 80/20 criteria policy: 80% weight for required hard skills, 20% for preferred tools, with zero black-box bias.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <span className="skill-tag-chip">
                  80/20 Policy Formula
                </span>
              </div>
            </Card>

            {/* Step 4 */}
            <Card className="flex flex-col justify-between border-slate-200/90 shadow-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-mono font-bold text-base">
                  04
                </div>
                <h3 className="font-display font-bold text-base text-ink">
                  Tailored ATS Export & Tracking
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate job-aligned resumes with embedded proof badges and track application progress from shortlist to offer through an immutable audit trail.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <span className="skill-tag-chip">
                  Real-Time Pipeline
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. SECTION: THREE AUDIENCE SECTIONS WITH DIFFERENT LAYOUTS */}
      {/* 4a. For Students: Split Banner Layout */}
      <section id="for-students" className="py-20 sm:py-24 bg-white border-b border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="eyebrow">For Candidates</span>
              <h2 className="sec-title">Stand out with verified work, not keyword stuffing.</h2>
              <p className="sec-lede">
                Tired of applying to jobs where resumes loaded with buzzwords win? ProofHire anchors your real code and projects directly to the recruiter's screen.
              </p>
              <ul className="space-y-3 text-sm text-slate-600 font-medium pt-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-fresh shrink-0 mt-0.5" />
                  <span>
                    <strong>Proof Badges that matter:</strong> When recruiters see a "Verified" badge, they know the code was parsed and checked.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-fresh shrink-0 mt-0.5" />
                  <span>
                    <strong>Fair missing-evidence policy:</strong> If you haven't linked proof for a skill, you aren't disqualified — it's simply transparent.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-fresh shrink-0 mt-0.5" />
                  <span>
                    <strong>One-click tailored resumes:</strong> Reorder your projects to emphasize what the specific vacancy requires.
                  </span>
                </li>
              </ul>
              <div className="pt-3">
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Create Candidate Profile →
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-[14px] border border-slate-200 bg-paper-alt p-6 space-y-4 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="font-mono text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Candidate Feature Ledger
                  </span>
                  <span className="status-pill-dot bg-fresh/10 text-emerald-900 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-fresh"></span>
                    Audit Ready
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-white rounded-lg border border-line flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">Resume Studio</div>
                      <div className="text-[11px] text-slate-500">Targeted ATS layout generator with verification pill chips</div>
                    </div>
                    <span className="font-mono text-xs text-brand-700 font-semibold">Ready</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-line flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">Application Tracker</div>
                      <div className="text-[11px] text-slate-500">Milestone timelines: Applied → Shortlisted → Offer</div>
                    </div>
                    <span className="font-mono text-xs text-brand-700 font-semibold">Live</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-line flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">Skill Gap Analysis</div>
                      <div className="text-[11px] text-slate-500">Deterministic view of matched vs missing job requirements</div>
                    </div>
                    <span className="font-mono text-xs text-brand-700 font-semibold">80/20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4b. For Placement Officers: Governance & Cohort Metrics Layout */}
      <section id="for-officers" className="py-20 sm:py-24 bg-paper-alt border-b border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow">Institutional Governance</span>
            <h2 className="sec-title">For placement officers & department leads.</h2>
            <p className="sec-lede mx-auto">
              Automated deduplication across multiple job feeds, cohort readiness rankings, and tamper-proof verification before company drives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200/90 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-ink text-white flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-display font-bold text-base text-ink mb-2">
                Job Feed Ingestion & Dedupe
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Aggregates postings from recruiters, campus drives, and verified aggregators. Automatically identifies exact and fuzzy duplicates with human provenance audit.
              </p>
              <span className="skill-tag-chip">Jaccard Fuzzy Dedupe</span>
            </Card>

            <Card className="border-slate-200/90 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-ink text-white flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-display font-bold text-base text-ink mb-2">
                Batch Candidate Ranking
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Filter cohorts by verified requirements in seconds. Generate auditable shortlists for visiting recruiters without manual spreadsheet juggling.
              </p>
              <span className="skill-tag-chip">Deterministic 80/20 Score</span>
            </Card>

            <Card className="border-slate-200/90 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-ink text-white flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-display font-bold text-base text-ink mb-2">
                Cohort Trust & Audit Trail
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Maintain your university's reputation. Ensure students submitted to top engineering firms actually hold the skills verified on their record.
              </p>
              <span className="skill-tag-chip">Zero Fake Credentials</span>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/login/placement"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ink hover:text-brand-600 transition-colors"
            >
              Sign in with institutional placement credentials →
            </Link>
          </div>
        </div>
      </section>

      {/* 4c. For Recruiters & Companies: Compact Grid Layout */}
      <section className="py-20 sm:py-24 bg-white border-b border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="eyebrow">For Corporate Hiring</span>
              <h2 className="sec-title">Spend time interviewing, not filtering fake claims.</h2>
              <p className="sec-lede">
                Recruiters review hundreds of identical resumes claiming expertise in modern frameworks. ProofHire provides instant drill-down to repository commits and verified project artifacts.
              </p>
              <div className="pt-2">
                <Button variant="secondary" onClick={() => navigate('/vacancies')}>
                  Inspect Public Openings →
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-[14px] border border-slate-200 bg-paper-alt">
                <h4 className="font-display font-bold text-sm text-ink mb-1.5">
                  Direct Evidence Drill-down
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click on any listed skill on a candidate's profile to inspect code diffs and commit dates directly.
                </p>
              </div>
              <div className="p-5 rounded-[14px] border border-slate-200 bg-paper-alt">
                <h4 className="font-display font-bold text-sm text-ink mb-1.5">
                  Structured Vacancy Posting
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Define required vs preferred skills with clear canonical tags, preventing mismatched applicant spam.
                </p>
              </div>
              <div className="p-5 rounded-[14px] border border-slate-200 bg-paper-alt">
                <h4 className="font-display font-bold text-sm text-ink mb-1.5">
                  Explainable Fit Breakdown
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  See exact percentages of matching required skills vs bonus preferences before inviting for technical rounds.
                </p>
              </div>
              <div className="p-5 rounded-[14px] border border-slate-200 bg-paper-alt">
                <h4 className="font-display font-bold text-sm text-ink mb-1.5">
                  Pipeline Stage Synchronization
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time synchronization between corporate hiring managers and college placement administrative staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRINCIPLES & TRUST SECTION (Honest voice matching reference) */}
      <section id="principles" className="py-20 sm:py-24 bg-paper-alt border-b border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow">Integrity Principles</span>
            <h2 className="sec-title">No fake guarantees. Real engineering facts.</h2>
            <p className="sec-lede mx-auto">
              We reject opaque scoring black-boxes, arbitrary AI rating bots, and deceptive placement claims. Here is our exact code of conduct.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-[14px] bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                <h3 className="font-display font-bold text-base text-ink">
                  Missing evidence is not treated as dishonesty
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If a candidate has not yet linked a repository or exam grade for a skill, ProofHire simply marks it as <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">Unverified Claim</span>. We do not apply arbitrary score penalties or accuse students of dishonesty.
              </p>
            </div>

            <div className="p-6 rounded-[14px] bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                <h3 className="font-display font-bold text-base text-ink">
                  No fake 100% placement guarantees
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Institutes claiming 100% placement guarantees often rely on asterisks and dubious partnerships. ProofHire provides the platform, deterministic matching, and verifiable evidence — real competence wins real jobs.
              </p>
            </div>

            <div className="p-6 rounded-[14px] bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                <h3 className="font-display font-bold text-base text-ink">
                  Explainable 80/20 math, zero black-box AI
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Match percentages are mathematically deterministic: 80% weight allocated strictly to non-negotiable required skills, and 20% to preferred bonus tools. Candidates and officers can calculate scores by hand.
              </p>
            </div>

            <div className="p-6 rounded-[14px] bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                <h3 className="font-display font-bold text-base text-ink">
                  Candidate consent and privacy sovereignty
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Candidate resumes, grades, and code repositories are never shared with recruiters or external parties until the student explicitly applies to a specific vacancy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 sm:py-24 bg-white border-b border-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="eyebrow">Frequently Asked Questions</span>
            <h2 className="sec-title">Straight answers to common questions.</h2>
            <p className="sec-lede mx-auto">
              Everything you need to know about the verification process, candidate privacy, and match score calculation.
            </p>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {[
              {
                q: "Do I need a GitHub account or public repositories to register as a student?",
                a: "No. You can register with your campus email and upload your existing resume. ProofHire extracts your skills and projects for review. While connecting GitHub or project URLs enables the 'Verified' badge, it is completely optional and never a barrier to account creation."
              },
              {
                q: "What happens if I make a claim on my resume without attached evidence?",
                a: "The claim is clearly rendered with an 'Unverified Claim' badge. It is visible to recruiters as a self-reported claim. It simply does not count toward the verified evidence tier of the matching formula, but it is never treated as a violation."
              },
              {
                q: "How exactly is the Match Score calculated?",
                a: "Our formula is strictly transparent: Match Score = (Matched Required Skills / Total Required Skills × 80%) + (Matched Preferred Skills / Total Preferred Skills × 20%). A candidate meeting all required skills automatically scores at least 80%."
              },
              {
                q: "Can placement officers edit or remove my evidence?",
                a: "Officers can verify, review, or flag evidence items against institutional records, but they cannot fabricate or silently delete your candidate claims. Every status transition is immutably logged with an auditor timestamp."
              },
              {
                q: "Can companies contact me without me applying to their opening?",
                a: "No. Your contact information and evidence repository links are only shared with recruiters after you explicitly submit an application for their posted campus vacancy."
              }
            ].map((faq, idx) => (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left flex items-center justify-between gap-4 font-display font-bold text-base text-ink hover:text-brand-700 transition-colors focus:outline-none"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <span className="font-mono text-xl text-brand-500 font-normal shrink-0 transition-transform duration-200">
                    {openFaq === idx ? '×' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed font-sans pr-8">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLOSING CTA BAND (Reference .cta-sec dark styling) */}
      <section className="py-20 sm:py-24 bg-ink text-text-on-dark relative overflow-hidden">
        {/* Subtle dark grid wash */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(241, 242, 240, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 242, 240, 0.12) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 70%)',
          }}
        />

        <div className="max-w-site mx-auto px-4 sm:px-6 relative z-10 text-center max-w-2xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3 block">
            Begin With Proof
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight mb-4">
            Ready to prove your skills with <span className="text-brand-500">verifiable evidence?</span>
          </h2>
          <p className="text-muted-on-dark text-sm sm:text-base leading-relaxed mb-8">
            Create your candidate profile in two minutes, extract your resume claims, and browse campus openings with deterministic match scores.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/register')}
              className="text-xs sm:text-sm px-6 font-bold shadow-btn-amber"
            >
              Register as a student →
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/vacancies')}
              className="text-xs sm:text-sm px-6 font-semibold border-white/30 text-white hover:bg-white hover:text-ink"
            >
              Browse active vacancies
            </Button>
          </div>
        </div>
      </section>

      {/* 8. FOUR-COLUMN FOOTER */}
      <footer className="bg-paper-alt text-slate-500 pt-16 pb-12 border-t border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand & Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-ink">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="font-display font-bold text-base text-ink">
                  Proof<span className="text-brand-600">Hire</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Evidence-based campus placement hub for institutional hiring, tamper-proof skill ledgers, and explainable job matching.
              </p>
              <div className="pt-1 font-mono text-[11px] text-slate-400">
                Pune Campus • Shivajinagar, MH 411004
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="font-mono text-xs font-semibold tracking-wider uppercase text-brand-700 mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/vacancies" className="hover:text-ink transition-colors">Campus Vacancies</Link></li>
                <li><a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a></li>
                <li><a href="#for-students" className="hover:text-ink transition-colors">For Students</a></li>
                <li><a href="#for-officers" className="hover:text-ink transition-colors">For Placement Officers</a></li>
                <li><Link to="/register" className="hover:text-ink transition-colors font-semibold text-brand-700">Student Registration</Link></li>
              </ul>
            </div>

            {/* Col 3: Authentication & Portals */}
            <div>
              <h4 className="font-mono text-xs font-semibold tracking-wider uppercase text-brand-700 mb-4">
                Portals
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/login/student" className="hover:text-ink transition-colors">Candidate Sign In</Link></li>
                <li><Link to="/login/placement" className="hover:text-ink transition-colors">Placement Officer Hub</Link></li>
                <li><Link to="/login" className="hover:text-ink transition-colors">Portal Selector</Link></li>
                <li><a href="#principles" className="hover:text-ink transition-colors">Honesty & Audit Rules</a></li>
                <li><a href="#faq" className="hover:text-ink transition-colors">Verification FAQ</a></li>
              </ul>
            </div>

            {/* Col 4: Central Placement Cell Contact */}
            <div>
              <h4 className="font-mono text-xs font-semibold tracking-wider uppercase text-brand-700 mb-4">
                Central Placement Cell
              </h4>
              <address className="not-italic text-xs space-y-2 text-slate-500 leading-relaxed">
                <p className="font-medium text-ink">TechSummit Institute of Technology</p>
                <p>Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004</p>
                <p className="font-mono text-[11px]">Mon – Sat: 8:00 AM – 7:30 PM</p>
                <p className="font-mono text-[11px] text-brand-700">admin@proofhire.edu</p>
              </address>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div>
              © 2026 ProofHire Placement Hub. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Deterministic 80/20 Ledger</span>
              <span>•</span>
              <span>WCAG AAA Accessible</span>
              <span>•</span>
              <span>Zero Fake Scores</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 9. MOBILE BOTTOM ACTION BAR (Fixed on mobile screens < 700px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-line flex items-center shadow-lg">
        <Link
          to="/login/student"
          className="flex-1 py-3 text-center font-mono text-xs font-bold text-ink border-r border-line hover:bg-slate-50"
        >
          Student Login
        </Link>
        <Link
          to="/vacancies"
          className="flex-1 py-3 text-center font-mono text-xs font-bold text-ink border-r border-line hover:bg-slate-50"
        >
          Vacancies
        </Link>
        <Link
          to="/register"
          className="flex-1 py-3 text-center font-mono text-xs font-bold bg-brand-500 text-ink hover:bg-brand-600"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};
