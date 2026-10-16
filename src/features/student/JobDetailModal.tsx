import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Send,
  FileText,
  Lock
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MatchScoreBar } from '@/components/data-display/MatchScoreBar';
import { Job } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';

export interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  isApplying?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  isApplying,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, currentRole } = useAuth();

  if (!job) return null;

  const handleGenerateResume = () => {
    onClose();
    navigate(`/student/resume-studio?jobId=${job.id}`);
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login/student');
      return;
    }
    if (onApply) onApply(job.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
      description={`${job.company} • ${job.location}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Header Summary */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {job.department || 'Engineering Unit'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {job.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              <IndianRupee className="w-3 h-3 text-slate-500" />
              {job.salaryRange}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deadline: {job.deadline}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {job.hasApplied ? (
              <Badge variant="success">Application Submitted</Badge>
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateResume}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Generate Tailored Resume</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyClick}
                  isLoading={isApplying}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply Now</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleApplyClick}
                className="gap-1.5 text-xs font-semibold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Apply</span>
              </Button>
            )}
          </div>
        </div>

        {/* Authenticated Student Match Fit Bar */}
        {isAuthenticated && (
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Deterministic Skill Fit Calculation
                </h4>
              </div>
              <span className="text-[10px] font-mono font-semibold text-brand-800">
                Policy v1.0 (80% Required + 20% Preferred)
              </span>
            </div>

            <MatchScoreBar score={job.matchedScore} size="md" />

            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded border border-blue-100">
              {job.matchedScore && job.matchedScore >= 80
                ? 'Strong match: Proctored React benchmark (94%) and evaluated capstone project satisfy core requirements. TypeScript verified via repository audit. Node.js project review is underway.'
                : 'Moderate fit: Candidate possesses foundational skills but lacks verified proof for 1 or more required technologies.'}
            </p>
          </div>
        )}

        {/* Required & Preferred Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-600" />
              Required Skills (80% Weight)
            </h4>
            <div className="space-y-2">
              {job.requiredSkills.map((req) => (
                <div
                  key={req.skillId}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-bold text-slate-800">{req.canonicalName}</span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Evidence
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Preferred Skills (20% Weight)
            </h4>
            <div className="space-y-2">
              {job.preferredSkills.map((pref) => (
                <div
                  key={pref.skillId}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-bold text-slate-800">{pref.canonicalName}</span>
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Review Pending / Missing
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Original Job Description (Preserved) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Original Role Description & Deliverables
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
          <p className="font-bold text-slate-800">Eligibility Criteria:</p>
          <p className="text-slate-600">
            Minimum CGPA: <strong>{job.eligibilityCriteria.minimumCgpa}</strong> • Allowed Departments:{' '}
            <strong>{job.eligibilityCriteria.allowedDepartments.join(', ')}</strong> • Graduating Class:{' '}
            <strong>{job.eligibilityCriteria.graduationYear.join(', ')}</strong>
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateResume}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Generate Resume for This Job</span>
                </Button>
                {!job.hasApplied && (
                  <Button
                    size="sm"
                    onClick={handleApplyClick}
                    isLoading={isApplying}
                    className="gap-1.5 font-semibold text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </Button>
                )}
              </>
            ) : (
              <Button size="sm" onClick={handleApplyClick} className="font-semibold text-xs">
                Sign In to Apply
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
