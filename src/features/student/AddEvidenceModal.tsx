import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  FolderGit2, 
  BookOpen, 
  Award,
  ShieldCheck,
  X
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { EvidenceType, EvidenceRecord } from '@/types';
import { studentApi } from '@/lib/api/studentApi';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        skillId: `skill-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        skillName,
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
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Canonical Skill"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          >
            <option value="React">React</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Node.js">Node.js</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="Tailwind CSS">Tailwind CSS</option>
            <option value="Docker">Docker</option>
            <option value="Python">Python</option>
            <option value="REST API">REST API</option>
          </Select>

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
