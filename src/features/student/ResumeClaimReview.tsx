import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  RefreshCw,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { studentApi } from '@/lib/api/studentApi';
import { ResumeClaim } from '@/types';

export const ResumeClaimReview: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    fileName: string;
    extractedTextCount: number;
    claims: ResumeClaim[];
    summary: { supported: number; needsReview: number; contradicted: number };
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const valid = ['.pdf', '.docx', '.txt', '.md'].some(ext => selected.name.toLowerCase().endsWith(ext));
      if (!valid) {
        showToast('Please upload a PDF, DOCX, or text resume document', 'error');
        return;
      }
      setFile(selected);
      setReviewResult(null);
    }
  };

  const handleStartClaimReview = async () => {
    if (!file) {
      showToast('Select a resume file first', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await studentApi.reviewUploadedResumeClaims(file);
      setReviewResult(result);
      showToast('Resume claims extracted and matched against evidence ledger', 'success');
    } catch {
      showToast('Failed to review resume claims', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Resume Claim Review & Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload an existing candidate resume to automatically extract factual claims and cross-reference them against verified proofs.
        </p>
      </div>

      {/* Upload Box */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-brand-600" />
              <CardTitle>Upload Document for Verification</CardTitle>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              AI Auditor
            </span>
          </div>
          <CardDescription>
            Supports PDF, DOCX, and TXT files up to 10MB. The AI analysis engine parses claims dynamically and compares them to your verified evidence ledger.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 text-brand-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-brand-600 hover:text-brand-700">Click to browse</span>
                <span className="text-slate-500"> or drag and drop your resume file</span>
              </div>
              <p className="text-[11px] text-slate-400">PDF, DOCX, TXT up to 10MB</p>
            </label>

            {file && (
              <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 inline-flex items-center gap-2 text-xs font-semibold text-slate-800">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Missing evidence is marked <strong>Needs Review</strong>, never automatically labeled false or fraudulent.
              </span>
            </div>

            <Button
              onClick={handleStartClaimReview}
              isLoading={isProcessing}
              disabled={!file}
              className="w-full sm:w-auto"
            >
              Analyze Resume Claims
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Results */}
      {reviewResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Supported Claims
                </p>
                <h4 className="text-2xl font-black mt-0.5">{reviewResult.summary.supported}</h4>
                <p className="text-[11px] text-emerald-700">Matched with verified evidence</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Needs Review
                </p>
                <h4 className="text-2xl font-black mt-0.5">{reviewResult.summary.needsReview}</h4>
                <p className="text-[11px] text-amber-700">Unverified / Insufficient records</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500 opacity-80" />
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Contradicted / Unsupported
                </p>
                <h4 className="text-2xl font-black mt-0.5">{reviewResult.summary.contradicted}</h4>
                <p className="text-[11px] text-rose-700">Discrepancy detected</p>
              </div>
              <XCircle className="w-8 h-8 text-rose-500 opacity-80" />
            </div>
          </div>

          {/* Claims List */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Factual Claims & Evidence Cross-Reference</CardTitle>
              <CardDescription>
                Audited against repository commits, proctored benchmarks, and official coursework rubrics
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {reviewResult.claims.map((claim) => {
                const border = {
                  SUPPORTED: 'border-emerald-200 bg-white',
                  NEEDS_REVIEW: 'border-amber-200 bg-amber-50/20',
                  CONTRADICTED: 'border-rose-200 bg-rose-50/20',
                }[claim.status] || 'border-slate-200 bg-white';

                return (
                  <div
                    key={claim.id}
                    className={`p-4 rounded-xl border ${border} space-y-2.5 transition-all`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        "{claim.claimText}"
                      </p>
                      <StatusBadge status={claim.status} />
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <p className="font-semibold text-slate-800">Audit Explanation:</p>
                      <p className="text-slate-600 leading-relaxed">{claim.reason}</p>
                    </div>

                    {claim.evidenceTitle && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Source Artifact: <strong>{claim.evidenceTitle}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
