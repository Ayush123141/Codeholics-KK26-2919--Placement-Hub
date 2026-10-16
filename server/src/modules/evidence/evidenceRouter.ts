import { Router, Request, Response } from 'express';
import { EvidenceRecord, EvidenceReviewStatus, EvidenceSourceType } from '../../types';

export const evidenceStore: EvidenceRecord[] = [];

export class EvidenceRegistryService {
  /**
   * Add or register an evidence item for a student and skill
   */
  public registerEvidence(record: Omit<EvidenceRecord, 'id' | 'recordedAt'>): EvidenceRecord {
    const timestamp = new Date().toISOString();
    const evidence: EvidenceRecord = {
      ...record,
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      recordedAt: timestamp,
      statusHistory: [
        {
          toStatus: record.reviewStatus,
          changedBy: record.reviewedBy || 'System Ingestion',
          notes: record.reviewNotes || 'Initial artifact registration',
          timestamp,
        },
      ],
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
   * Update review status of an evidence item with full audit history
   */
  public updateReviewStatus(
    evidenceId: string,
    status: EvidenceReviewStatus,
    reviewer: string,
    notes?: string
  ): EvidenceRecord | null {
    const item = evidenceStore.find((e) => e.id === evidenceId);
    if (!item) return null;

    // Security requirement: Students cannot approve their own submissions
    if (reviewer.toLowerCase().includes('student') || reviewer === item.studentId) {
      throw new Error('Permission denied: Students cannot review or approve their own evidence submissions.');
    }

    const previousStatus = item.reviewStatus;
    item.reviewStatus = status;
    item.reviewedBy = reviewer;
    if (notes) item.reviewNotes = notes;

    if (!item.statusHistory) item.statusHistory = [];
    item.statusHistory.push({
      fromStatus: previousStatus,
      toStatus: status,
      changedBy: reviewer,
      notes: notes || `Status updated from ${previousStatus} to ${status}`,
      timestamp: new Date().toISOString(),
    });

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
  const { studentId, skillId, sourceType, title, description, score, evidenceUrl, reviewStatus, reviewedBy, reviewNotes } =
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
    reviewedBy,
    reviewNotes,
  });

  return res.status(201).json({ success: true, evidence: registered });
});

// PATCH /api/evidence/:id/status - Update evidence status with decision and notes
evidenceRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status, reviewer, notes } = req.body;
  if (!status || !reviewer) {
    return res.status(400).json({ success: false, error: 'status and reviewer are required.' });
  }

  try {
    const updated = evidenceRegistryService.updateReviewStatus(
      req.params.id,
      status as EvidenceReviewStatus,
      reviewer,
      notes
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Evidence record not found.' });
    }

    return res.json({ success: true, evidence: updated });
  } catch (err: any) {
    return res.status(403).json({ success: false, error: err.message });
  }
});
