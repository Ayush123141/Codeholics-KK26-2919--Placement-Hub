import React, { useState } from 'react';
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
  const [skillName, setSkillName] = useState('React');
  const [type, setType] = useState<EvidenceType>('PROJECT');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      showToast('Please fill in title and evaluation details', 'error');
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
        status: type === 'CERTIFICATE' ? 'NEEDS_REVIEW' : 'REVIEWED',
        date: new Date().toISOString().split('T')[0],
        verifier: type === 'CERTIFICATE' ? 'Manual Verification Queue' : 'Peer / Faculty Evaluation Queue',
        details,
      });

      onEvidenceAdded(created);
      showToast('Evidence artifact submitted successfully', 'success');
      onClose();
      // Reset form
      setTitle('');
      setSourceUrl('');
      setDetails('');
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
      description="Connect practical code, proctored benchmarks, or credentials to prove your skill proficiency."
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
          </Select>

          <Select
            label="Evidence Type"
            value={type}
            onChange={(e) => setType(e.target.value as EvidenceType)}
          >
            <option value="PROJECT">Evaluated Project</option>
            <option value="GITHUB">GitHub Repository Audit</option>
            <option value="ASSESSMENT">Standardized Assessment</option>
            <option value="CERTIFICATE">Credential / Certificate</option>
            <option value="COURSEWORK">Campus Coursework</option>
          </Select>
        </div>

        <Input
          label="Artifact Title"
          placeholder="e.g. Real-Time Telemetry Dashboard or LeetCode Proctored Contest"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Public Repository / Credential URL (Optional)"
          placeholder="https://github.com/username/project"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Evaluation Details & Implementation Scope <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="Describe the rubric, architecture, or verifiable implementation..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
          <p className="font-semibold text-slate-800">Review Policy:</p>
          <p>
            Submitted evidence is set to <strong>Reviewed</strong> or <strong>Needs Review</strong> until verified by automated AST audit or placement officer signoff.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Submit Artifact
          </Button>
        </div>
      </form>
    </Modal>
  );
};
