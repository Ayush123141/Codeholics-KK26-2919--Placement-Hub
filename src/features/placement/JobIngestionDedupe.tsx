import React, { useState, useEffect } from 'react';
import { 
  CopyCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Building2, 
  User, 
  Calendar, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
  Sparkles,
  Plus,
  Wand2,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { placementApi } from '@/lib/api/placementApi';
import { llmAssistService, EnrichedParsedJobSkills } from '@/lib/services/llmAssist';
import { JobSource, JobSourceType } from '@/types';

export const JobIngestionDedupe: React.FC = () => {
  const { showToast } = useToast();
  const [sources, setSources] = useState<JobSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<JobSource | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // AI Ingest Modal states
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [roleTitle, setRoleTitle] = useState('Full Stack Cloud Engineer');
  const [companyName, setCompanyName] = useState('DevPulse Technologies');
  const [sourceType, setSourceType] = useState<JobSourceType>('COMPANY_POSTING');
  const [jdText, setJdText] = useState(
    'Looking for a Senior Full Stack Cloud Engineer with 3+ years experience in React, TypeScript, and Node.js. Must be proficient in PostgreSQL and REST APIs. Experience with Docker, Kubernetes, or AWS is strongly preferred.'
  );
  const [parsedSkills, setParsedSkills] = useState<EnrichedParsedJobSkills | null>(null);

  useEffect(() => {
    async function loadSources() {
      const data = await placementApi.getJobSources();
      setSources(data);
    }
    loadSources();
  }, []);

  const handleOpenCompare = (source: JobSource) => {
    setSelectedSource(source);
    setIsCompareOpen(true);
  };

  const handleResolveDuplicate = async (sourceId: string, decision: 'APPROVED_MERGE' | 'REJECTED_SEPARATE') => {
    setIsProcessing(true);
    try {
      const updated = await placementApi.resolveDuplicate(sourceId, decision);
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, ...updated } : s))
      );
      showToast(
        decision === 'APPROVED_MERGE'
          ? 'Duplicate confirmed. Source merged into canonical job while preserving full provenance.'
          : 'Duplicate rejected. Record retained as distinct opening.',
        'success'
      );
      setIsCompareOpen(false);
    } catch {
      showToast('Failed to resolve duplicate decision', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseJDWithAI = async () => {
    if (!jdText.trim()) {
      showToast('Please enter a job description to analyze', 'error');
      return;
    }
    setIsParsing(true);
    try {
      const result = await llmAssistService.parseJobDescriptionWithLLM(jdText);
      setParsedSkills(result);
      if (result.isLLM) {
        showToast(
          `OpenRouter AI extracted ${result.requiredSkills.length} required & ${result.preferredSkills.length} preferred skills!`,
          'success'
        );
      } else {
        showToast('Extracted skills using local pattern matching engine', 'info');
      }
    } catch {
      showToast('Failed to parse JD', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveIngestedJob = () => {
    if (!roleTitle.trim() || !companyName.trim()) {
      showToast('Please provide role title and company name', 'error');
      return;
    }

    const isDuplicate = sources.some(
      (s) =>
        s.sourceName.toLowerCase().includes(companyName.toLowerCase()) ||
        s.sourceName.toLowerCase().includes(roleTitle.toLowerCase())
    );

    const newSource: JobSource = {
      id: `src-ai-${Date.now()}`,
      jobId: isDuplicate ? 'job-demo-001' : `job-custom-${Date.now()}`,
      sourceType,
      sourceName: `${companyName} (${roleTitle})`,
      submittedBy: 'Placement Officer via OpenRouter AI Parser',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duplicateWarning: isDuplicate,
      duplicateCandidateTitle: isDuplicate ? 'Frontend Platform Engineer — CloudScale Technologies' : undefined,
      duplicateConfidence: isDuplicate ? 86 : undefined,
      resolutionStatus: isDuplicate ? 'PENDING' : 'APPROVED_MERGE',
      url: 'https://careers.company.com/postings/' + Date.now().toString().slice(-5),
      rawPayload: {
        roleTitle,
        companyName,
        jdText,
        extractedSkills: parsedSkills,
      },
    };

    setSources([newSource, ...sources]);
    showToast(
      isDuplicate
        ? 'Job opening ingested! Potential duplicate flagged for officer verification.'
        : 'Job opening successfully ingested and registered in provenance ledger.',
      'success'
    );
    setIsIngestModalOpen(false);
    setParsedSkills(null);
  };

  const pendingWarnings = sources.filter((s) => s.duplicateWarning && s.resolutionStatus === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Job Ingestion & Duplicate Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Openings arrive via company postings, alumni referrals, and API adapters. The backend flags candidate duplicates for officer review while preserving source history.
          </p>
        </div>
        <Button
          onClick={() => setIsIngestModalOpen(true)}
          className="gap-2 self-start sm:self-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-xs font-semibold"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Ingest & Parse JD</span>
        </Button>
      </div>

      {/* Duplicate Warning Callout */}
      {pendingWarnings.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {pendingWarnings.length} Potential Duplicate Openings Detected
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Backend deduplication detected overlapping role titles, company names, and canonical URLs. Review before candidate matching.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="md">
            Requires Human Review
          </Badge>
        </div>
      )}

      {/* Sources Table / Cards */}
      <div className="space-y-4">
        {sources.map((src) => {
          const typeBadge = {
            COMPANY_POSTING: <Badge variant="info">Company Direct Posting</Badge>,
            ALUMNI_REFERRAL: <Badge variant="purple">Alumni Referral</Badge>,
            API_INGESTION: <Badge variant="slate">National Placement API</Badge>,
          }[src.sourceType];

          return (
            <Card
              key={src.id}
              className={`space-y-3 transition-all ${
                src.duplicateWarning ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {typeBadge}
                  <span className="text-xs font-bold text-slate-900">{src.sourceName}</span>
                </div>
                {src.resolutionStatus === 'APPROVED_MERGE' && (
                  <Badge variant="success">Merged with Canonical Job</Badge>
                )}
                {src.resolutionStatus === 'REJECTED_SEPARATE' && (
                  <Badge variant="slate">Kept as Separate Opening</Badge>
                )}
                {src.resolutionStatus === 'PENDING' && src.duplicateWarning && (
                  <Badge variant="warning">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Duplicate Warning ({src.duplicateConfidence}% Match)
                  </Badge>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <span>
                    Submitted by: <strong>{src.submittedBy}</strong>
                  </span>
                  <span>Timestamp: {src.submittedAt}</span>
                  {src.externalId && <span>External ID: {src.externalId}</span>}
                </div>

                {src.duplicateWarning && (
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Candidate Duplicate:</p>
                      <p className="text-[11px] text-amber-800">{src.duplicateCandidateTitle}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCompare(src)}
                      className="border-amber-300 text-amber-900 hover:bg-amber-100"
                    >
                      Compare Records
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Canonical Job ID: {src.jobId}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                  >
                    <span>Inspect Source Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Duplicate Comparison Modal */}
      {selectedSource && (
        <Modal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          title="Review Job Duplicate Suggestion"
          description={`Incoming Source: ${selectedSource.sourceName} • Confidence: ${selectedSource.duplicateConfidence}%`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                The backend detected high lexical and skill similarity. Approving merges this referral/API source with the canonical job while maintaining provenance in <code>job_sources</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Existing Canonical Record */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Canonical Record</span>
                <h4 className="text-sm font-bold text-slate-900">
                  Frontend Platform Engineer — CloudScale Technologies
                </h4>
                <p className="text-slate-600">
                  Primary company submission via recruiter portal. Linked to active placement campaign.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="default" size="sm">React</Badge>
                  <Badge variant="default" size="sm">TypeScript</Badge>
                </div>
              </div>

              {/* Incoming Duplicate Candidate */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-700">Incoming Record</span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedSource.duplicateCandidateTitle}
                </h4>
                <p className="text-slate-600">
                  Submitted by {selectedSource.submittedBy} at {selectedSource.submittedAt}.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="default" size="sm">ReactJS</Badge>
                  <Badge variant="default" size="sm">TypeScript</Badge>
                </div>
              </div>
            </div>

            {/* Decision Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleResolveDuplicate(selectedSource.id, 'REJECTED_SEPARATE')}
                isLoading={isProcessing}
                className="gap-1.5 text-slate-700"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Keep as Separate Opening</span>
              </Button>

              <Button
                variant="primary"
                onClick={() => handleResolveDuplicate(selectedSource.id, 'APPROVED_MERGE')}
                isLoading={isProcessing}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Merge & Link Source</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Job Ingestion Modal */}
      <Modal
        isOpen={isIngestModalOpen}
        onClose={() => {
          setIsIngestModalOpen(false);
          setParsedSkills(null);
        }}
        title="AI Job Ingestion & Skill Parser"
        description="Powered by OpenRouter AI (gpt-4o-mini). Extracts structured technical skills from unstructured job descriptions."
        size="lg"
      >
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Quick Sample JDs:</span>
            <button
              type="button"
              onClick={() => {
                setRoleTitle('Full Stack Cloud Engineer');
                setCompanyName('DevPulse Technologies');
                setJdText('Looking for a Full Stack Cloud Engineer with experience in React, TypeScript, and Node.js. Proficient with PostgreSQL and Docker. AWS experience is a plus.');
                setParsedSkills(null);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
            >
              Full Stack Cloud
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTitle('Data Platform Engineer');
                setCompanyName('MetricsCore Analytics');
                setJdText('We need a Data Platform Engineer experienced in Python, SQL, and Apache Kafka. Familiarity with Spark and Kubernetes is desirable.');
                setParsedSkills(null);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
            >
              Data Platform
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTitle('Frontend Platform Engineer');
                setCompanyName('CloudScale Technologies');
                setJdText('Senior Frontend Platform Engineer with strong command of React, TypeScript, and Jest. Experience in Next.js and CI/CD pipelines preferred.');
                setParsedSkills(null);
              }}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-medium transition-colors"
            >
              Simulate Duplicate JD
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as JobSourceType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white font-semibold"
              >
                <option value="COMPANY_POSTING">Company Direct Posting</option>
                <option value="ALUMNI_REFERRAL">Alumni Referral</option>
                <option value="API_INGESTION">National Placement API</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Raw Job Description (JD)</label>
              <span className="text-[11px] text-slate-400">Pasted from recruiter email or job board</span>
            </div>
            <textarea
              rows={4}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste complete job description requirements here..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
            />
          </div>

          {/* AI Parser Action */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-xs text-slate-600">
                Uses OpenRouter API to structure skills into evidence matching taxonomy.
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleParseJDWithAI}
              isLoading={isParsing}
              className="gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Extract Skills with OpenRouter AI</span>
            </Button>
          </div>

          {/* Parsed Output Card */}
          {parsedSkills && (
            <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Extracted & Normalized Skills</span>
                {parsedSkills.isLLM ? (
                  <Badge variant="purple" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    OpenRouter Verified (gpt-4o-mini)
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Local Regex Pattern Fallback
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Required Skills ({parsedSkills.requiredSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedSkills.requiredSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold text-xs border border-emerald-300"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{s.canonicalName}</span>
                      </span>
                    ))}
                    {parsedSkills.requiredSkills.length === 0 && (
                      <span className="text-slate-400 italic">No specific required skills extracted</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Preferred / Nice-to-Have Skills ({parsedSkills.preferredSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedSkills.preferredSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-semibold text-xs border border-blue-300"
                      >
                        <span>{s.canonicalName}</span>
                      </span>
                    ))}
                    {parsedSkills.preferredSkills.length === 0 && (
                      <span className="text-slate-400 italic">No preferred skills listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsIngestModalOpen(false);
                setParsedSkills(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveIngestedJob}
              disabled={!parsedSkills}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Ingest Opening</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
