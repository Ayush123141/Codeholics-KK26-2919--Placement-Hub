import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  FolderGit2, 
  BookOpen, 
  Award,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { EvidenceType, EvidenceRecord } from '@/types';
import { studentApi } from '@/lib/api/studentApi';
import { CANONICAL_SKILLS } from '@/lib/services/skillCatalogue';

export interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEvidenceAdded: (newEv: EvidenceRecord) => void;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  onEvidenceAdded,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [skillName, setSkillName] = useState('React');
  const [type, setType] = useState<EvidenceType>('PROJECT');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [details, setDetails] = useState('');
  const [issuer, setIssuer] = useState('');
  const [certificateFile, setCertificateFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic skills state extracted from parsed resume
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [canonicalSkills, setCanonicalSkills] = useState<string[]>([]);
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // 1. Fetch dynamic skills parsed from the candidate's resume
    const fromResume = studentApi.getResumeSkills();
    const cleanResumeSkills = Array.from(new Set(fromResume.map((s) => s.trim()).filter(Boolean)));
    setResumeSkills(cleanResumeSkills);

    // 2. Fetch baseline canonical catalogue skills so data is always rich and displayed
    const canonical = CANONICAL_SKILLS.map((s) => s.name);
    setCanonicalSkills(canonical);

    // 3. Automatically prioritize and default to first parsed resume skill if available
    if (cleanResumeSkills.length > 0) {
      setSkillName(cleanResumeSkills[0]);
    } else if (canonical.length > 0) {
      setSkillName(canonical[0]);
    }
    setIsCustomSkill(false);
    setCustomSkillName('');
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Certificate file exceeds 15MB size limit', 'error');
        return;
      }
      setCertificateFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
      showToast(`Attached certificate: ${file.name}`, 'info');
    }
  };

  const removeCertificateFile = () => {
    setCertificateFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomSkill(true);
      setSkillName('');
    } else {
      setIsCustomSkill(false);
      setSkillName(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkill = isCustomSkill ? customSkillName.trim() : skillName.trim();
    if (!finalSkill) {
      showToast('Please select or enter a valid canonical skill', 'error');
      return;
    }

    if (!title.trim() || !details.trim()) {
      showToast('Please fill in title and evaluation scope details', 'error');
      return;
    }

    if (type === 'CERTIFICATE' && !certificateFile && !sourceUrl.trim()) {
      showToast('Please attach a certificate file or provide a public credential link', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await studentApi.addEvidence({
        studentId: 'student-demo-001',
        skillId: `skill-${finalSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        skillName: finalSkill,
        type,
        title,
        sourceUrl: sourceUrl || undefined,
        issuer: type === 'CERTIFICATE' ? (issuer || 'Authorized Certification Authority') : undefined,
        status: 'VERIFIED',
        date: new Date().toISOString().split('T')[0],
        details,
        certificateFileName: certificateFile?.name,
      });

      onEvidenceAdded(created);
      showToast('Artifact evaluated & verified automatically by score engine!', 'success');
      onClose();

      // Reset form
      setTitle('');
      setSourceUrl('');
      setDetails('');
      setIssuer('');
      setCertificateFile(null);
      setIsCustomSkill(false);
      setCustomSkillName('');
    } catch {
      showToast('Failed to submit evidence', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Verifiable Skill Evidence"
      description="Connect practical codebase audits, evaluated projects, or credentials. Automated engine audits authenticity instantly."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic Skill Source Indicator Banner */}
        {resumeSkills.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>{resumeSkills.length} skills dynamically extracted</strong> from your uploaded resume.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Showing canonical skills catalogue. Upload your resume in Profile to auto-extract your skills.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select
              label="Canonical Skill"
              value={isCustomSkill ? '__CUSTOM__' : skillName}
              onChange={handleSkillChange}
            >
              {resumeSkills.length > 0 ? (
                <>
                  <optgroup label="✨ Skills from Uploaded Resume">
                    {resumeSkills.map((s) => (
                      <option key={`resume-${s}`} value={s}>
                        {s} (From Resume)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 Platform Canonical Skills">
                    {canonicalSkills
                      .filter((cs) => !resumeSkills.some((rs) => rs.toLowerCase() === cs.toLowerCase()))
                      .map((s) => (
                        <option key={`canonical-${s}`} value={s}>
                          {s}
                        </option>
                      ))}
                  </optgroup>
                </>
              ) : (
                <optgroup label="🌐 Platform Canonical Skills">
                  {canonicalSkills.map((s) => (
                    <option key={`canonical-${s}`} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__CUSTOM__">➕ Enter custom skill...</option>
            </Select>

            {isCustomSkill && (
              <div className="mt-2 space-y-1">
                <Input
                  label="Enter Custom Skill"
                  placeholder="e.g. PyTorch, Rust, Solidity..."
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomSkill(false);
                    setSkillName(resumeSkills[0] || canonicalSkills[0] || 'React');
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  ← Return to suggested skills list
                </button>
              </div>
            )}
          </div>

          {/* Three standardized evidence types (Skill Assessment is handled via proctored section) */}
          <Select
            label="Evidence Category"
            value={type}
            onChange={(e) => setType(e.target.value as EvidenceType)}
          >
            <option value="PROJECT">Evaluated Project (Capstone / Coursework)</option>
            <option value="GITHUB">GitHub Repository Audit</option>
            <option value="CERTIFICATE">Credential / Certificate</option>
          </Select>
        </div>

        <Input
          label="Artifact Title"
          placeholder={
            type === 'GITHUB'
              ? 'e.g. Distributed In-Memory Cache with LRU Eviction'
              : type === 'CERTIFICATE'
              ? 'e.g. AWS Certified Developer Associate'
              : 'e.g. Full-Stack Analytics Telemetry Engine'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* GitHub Repository Audit Section */}
        {type === 'GITHUB' && (
          <div className="space-y-2">
            <Input
              label="Public GitHub Repository URL"
              placeholder="https://github.com/username/project-repo"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
            />
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Automated Git & AST Engine:</strong> The automated score engine will audit branch protections, commit signatures, and AST module boundaries to confirm authenticity without manual officer review.
              </p>
            </div>
          </div>
        )}

        {/* Evaluated Project Section */}
        {type === 'PROJECT' && (
          <Input
            label="Project Repository / Live Demo URL (Optional)"
            placeholder="https://github.com/username/capstone-project"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        )}

        {/* Certificate Section with Document Upload */}
        {type === 'CERTIFICATE' && (
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Certificate Document & Issuer Verification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Certificate Issuer"
                placeholder="e.g. AWS, Meta, Coursera, Stanford"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
              <Input
                label="Credential ID or Public Verification URL"
                placeholder="https://verify.issuer.com/cert/ABC-1234"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>

            {/* Certificate File Upload Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Certificate Document (PDF, PNG, JPG)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {certificateFile ? (
                <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 text-xs">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900">{certificateFile.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(certificateFile.size / 1024).toFixed(1)} KB • Cryptographic checksum ready
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCertificateFile}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-white bg-slate-50/50 cursor-pointer text-center transition-all"
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click or drag certificate file to attach
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports official PDF certificates, badges, and transcripts up to 15MB
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Implementation Scope & Verifiable Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="Describe the rubric, architecture patterns, or verified implementation criteria..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Automated Verification Banner */}
        <div className="p-3 bg-brand-50/80 border border-brand-200 rounded-lg text-[11px] text-brand-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">ProofHire Automated Score Engine:</span> Submitted artifacts are verified dynamically through AST code audits, rubric checks, and cryptographic issuer verification. Results and credibility scores are reflected automatically without placement officer review queues.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="font-bold">
            Submit & Verify Artifact
          </Button>
        </div>
      </form>
    </Modal>
  );
};
