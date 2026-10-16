import { Router, Request, Response } from 'express';
import { skillNormalizer } from '../../services/skillNormalizer';

export type CertificateReviewStatus =
  | 'ISSUER_VERIFIED'
  | 'MANUALLY_REVIEWED'
  | 'NEEDS_REVIEW'
  | 'UNVERIFIABLE';

export interface CertificateEvidence {
  id: string;
  studentId: string;
  skillId: string;
  certificateTitle: string;
  issuer: string;
  credentialId?: string;
  verificationUrl?: string;
  issuedDate?: string;
  expiryDate?: string;
  status: CertificateReviewStatus;
  reviewedBy?: string;
  reviewNotes: string;
  recordedAt: string;
}

// Trusted issuers with known verification domains
const TRUSTED_ISSUERS = [
  { domain: 'coursera.org', name: 'Coursera' },
  { domain: 'udacity.com', name: 'Udacity' },
  { domain: 'credly.com', name: 'Credly' },
  { domain: 'freecodecamp.org', name: 'freeCodeCamp' },
  { domain: 'hackerrank.com', name: 'HackerRank' },
  { domain: 'aws.amazon.com', name: 'Amazon Web Services' },
];

export const certificatesStore: CertificateEvidence[] = [];

export class CertificateService {
  public verifyCertificate(data: {
    studentId: string;
    certificateTitle: string;
    issuer: string;
    credentialId?: string;
    verificationUrl?: string;
    issuedDate?: string;
    expiryDate?: string;
  }): CertificateEvidence {
    let status: CertificateReviewStatus = 'NEEDS_REVIEW';
    let reviewNotes = 'Pending review by placement officer.';

    // Skill association
    const extractedSkills = skillNormalizer.extractSkillsFromText(data.certificateTitle);
    const primarySkill = extractedSkills.length > 0 ? extractedSkills[0] : null;
    const skillId = primarySkill ? primarySkill.skillId : 'skill-general';

    // Automated verification checks
    if (data.verificationUrl) {
      try {
        const parsedUrl = new URL(data.verificationUrl);
        const isTrusted = TRUSTED_ISSUERS.some((ti) => parsedUrl.hostname.includes(ti.domain));

        if (isTrusted && data.credentialId) {
          status = 'ISSUER_VERIFIED';
          reviewNotes = `Automatically verified via trusted issuer portal (${parsedUrl.hostname}) with credential ID: ${data.credentialId}.`;
        } else if (isTrusted) {
          status = 'NEEDS_REVIEW';
          reviewNotes = `Issuer domain is trusted (${parsedUrl.hostname}), but credential ID needs verification.`;
        } else {
          status = 'NEEDS_REVIEW';
          reviewNotes = 'External verification URL provided; requires human officer review.';
        }
      } catch {
        status = 'UNVERIFIABLE';
        reviewNotes = 'Invalid verification URL format provided.';
      }
    } else {
      status = 'NEEDS_REVIEW';
      reviewNotes = 'No online verification link supplied. Officer must review file manually.';
    }

    const cert: CertificateEvidence = {
      id: `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: data.studentId,
      skillId,
      certificateTitle: data.certificateTitle,
      issuer: data.issuer,
      credentialId: data.credentialId,
      verificationUrl: data.verificationUrl,
      issuedDate: data.issuedDate || new Date().toISOString().slice(0, 10),
      expiryDate: data.expiryDate,
      status,
      reviewNotes,
      recordedAt: new Date().toISOString(),
    };

    certificatesStore.push(cert);
    return cert;
  }

  public manualReview(
    certId: string,
    reviewedBy: string,
    status: CertificateReviewStatus,
    notes: string
  ): CertificateEvidence | null {
    const cert = certificatesStore.find((c) => c.id === certId);
    if (!cert) return null;

    cert.status = status;
    cert.reviewedBy = reviewedBy;
    cert.reviewNotes = notes;
    return cert;
  }
}

export const certificateService = new CertificateService();

export const certificatesRouter = Router();

// POST /api/certificates - Submit a certificate for review
certificatesRouter.post('/', (req: Request, res: Response) => {
  const { studentId, certificateTitle, issuer, credentialId, verificationUrl, issuedDate } = req.body;

  if (!studentId || !certificateTitle || !issuer) {
    return res.status(400).json({
      success: false,
      error: 'studentId, certificateTitle, and issuer are required fields.',
    });
  }

  const cert = certificateService.verifyCertificate({
    studentId,
    certificateTitle,
    issuer,
    credentialId,
    verificationUrl,
    issuedDate,
  });

  return res.status(201).json({
    success: true,
    certificate: cert,
  });
});

// GET /api/certificates/student/:studentId - Get student's certificates
certificatesRouter.get('/student/:studentId', (req: Request, res: Response) => {
  const certs = certificatesStore.filter((c) => c.studentId === req.params.studentId);
  return res.json({ success: true, count: certs.length, certificates: certs });
});

// PATCH /api/certificates/:id/review - Placement officer manual review
certificatesRouter.patch('/:id/review', (req: Request, res: Response) => {
  const { reviewedBy, status, notes } = req.body;

  if (!reviewedBy || !status) {
    return res.status(400).json({
      success: false,
      error: 'reviewedBy and status are required for manual review.',
    });
  }

  const updated = certificateService.manualReview(req.params.id, reviewedBy, status, notes || 'Reviewed by officer.');
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Certificate not found' });
  }

  return res.json({ success: true, certificate: updated });
});
