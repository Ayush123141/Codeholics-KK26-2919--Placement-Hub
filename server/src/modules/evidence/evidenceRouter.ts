import { Router, Request, Response } from 'express';
import { EvidenceRecord, EvidenceReviewStatus, EvidenceSourceType } from '../../types';

export const evidenceStore: EvidenceRecord[] = [];

export class EvidenceRegistryService {
  /**
   * Add or register an evidence item for a student and skill
   */
  public registerEvidence(record: Omit<EvidenceRecord, 'id' | 'recordedAt'>): EvidenceRecord {
    const evidence: EvidenceRecord = {
      ...record,
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      recordedAt: new Date().toISOString(),
    };
    evidenceStore.push(evidence);
    return evidence;
  }

  /**
   * Retrieve all evidence records for a given student
   */
  public getStudentEvidence(studentId: string): EvidenceRecord[] {
    return evidenceStore.filter((e) => e.studentId === studentId);
  }

  /**
   * Retrieve student evidence filtered for a specific canonical skill
   */
  public getStudentEvidenceForSkill(studentId: string, skillId: string): EvidenceRecord[] {
    return evidenceStore.filter(
      (e) => e.studentId === studentId && e.skillId.toLowerCase() === skillId.toLowerCase()
    );
  }

  /**
   * Update review status of an evidence item
   */
  public updateReviewStatus(
    evidenceId: string,
    status: EvidenceReviewStatus,
    reviewer: string
  ): EvidenceRecord | null {
    const item = evidenceStore.find((e) => e.id === evidenceId);
    if (!item) return null;

    item.reviewStatus = status;
    item.reviewedBy = reviewer;
    return item;
  }
}

export const evidenceRegistryService = new EvidenceRegistryService();

export const evidenceRouter = Router();

// GET /api/evidence/student/:studentId - List all evidence for a student
evidenceRouter.get('/student/:studentId', (req: Request, res: Response) => {
  const records = evidenceRegistryService.getStudentEvidence(req.params.studentId);
  res.json({ success: true, count: records.length, evidence: records });
});

// POST /api/evidence - Manually or system-register evidence
evidenceRouter.post('/', (req: Request, res: Response) => {
  const { studentId, skillId, sourceType, title, description, score, evidenceUrl, reviewStatus } =
    req.body;

  if (!studentId || !skillId || !sourceType || !title) {
    return res.status(400).json({
      success: false,
      error: 'studentId, skillId, sourceType, and title are required fields.',
    });
  }

  const registered = evidenceRegistryService.registerEvidence({
    studentId,
    skillId,
    sourceType: sourceType as EvidenceSourceType,
    title,
    description: description || '',
    score: typeof score === 'number' ? score : undefined,
    evidenceUrl,
    reviewStatus: (reviewStatus as EvidenceReviewStatus) || 'NEEDS_REVIEW',
  });

  return res.status(201).json({ success: true, evidence: registered });
});

// PATCH /api/evidence/:id/status - Update evidence status (Officer Scrutiny)
evidenceRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status, reviewer, reviewNotes } = req.body;
  if (!status || !reviewer) {
    return res.status(400).json({ success: false, error: 'status and reviewer are required.' });
  }

  const updated = evidenceRegistryService.updateReviewStatus(
    req.params.id,
    status as EvidenceReviewStatus,
    reviewer
  );
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Evidence record not found.' });
  }

  if (reviewNotes) {
    updated.metadata = { ...(updated.metadata || {}), reviewNotes };
  }

  return res.json({ success: true, evidence: updated });
});

// GET /api/evidence/pending-review - List evidence items requiring scrutiny
evidenceRouter.get('/pending-review', (_req: Request, res: Response) => {
  const pending = evidenceStore.filter((e) => e.reviewStatus === 'NEEDS_REVIEW' || e.reviewStatus === 'EVIDENCE_FOUND');
  return res.json({ success: true, count: pending.length, evidence: pending });
});
