import React, { useState } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { UserRole, UserProfile } from '@/types';
import { DEMO_USERS } from '@/lib/api/demoData';

// Layouts
import { StudentLayout } from '@/layouts/StudentLayout';
import { PlacementLayout } from '@/layouts/PlacementLayout';
import { CompanyLayout } from '@/layouts/CompanyLayout';

// Student Portal Pages
import { StudentDashboard } from '@/features/student/StudentDashboard';
import { StudentProfile } from '@/features/student/StudentProfile';
import { StudentEvidence } from '@/features/student/StudentEvidence';
import { JobDiscovery } from '@/features/student/JobDiscovery';
import { ResumeStudio } from '@/features/student/ResumeStudio';
import { ResumeClaimReview } from '@/features/student/ResumeClaimReview';
import { ApplicationTracker } from '@/features/student/ApplicationTracker';

// Placement Officer Pages
import { PlacementDashboard } from '@/features/placement/PlacementDashboard';
import { CampaignManagement } from '@/features/placement/CampaignManagement';
import { JobIngestionDedupe } from '@/features/placement/JobIngestionDedupe';
import { StudentEvidenceOverview } from '@/features/placement/StudentEvidenceOverview';
import { BatchRankingShortlist } from '@/features/placement/BatchRankingShortlist';
import { ApplicationStageManager } from '@/features/placement/ApplicationStageManager';

// Company Recruiter Pages
import { CompanyDashboard } from '@/features/company/CompanyDashboard';
import { VacancyManagement } from '@/features/company/VacancyManagement';
import { CandidateShortlist } from '@/features/company/CandidateShortlist';
import { InterviewPipeline } from '@/features/company/InterviewPipeline';

// Auth Page
import { LoginPage } from '@/features/auth/LoginPage';

export const AppRouter: React.FC = () => {
  // Check stored session or default to STUDENT
  const storedUserRaw = typeof window !== 'undefined' ? sessionStorage.getItem('proofhire_user') : null;
  const initialRole: UserRole = storedUserRaw ? JSON.parse(storedUserRaw).role : 'STUDENT';

  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);

  const currentUser: UserProfile =
    currentRole === 'STUDENT'
      ? DEMO_USERS.student
      : currentRole === 'PLACEMENT_OFFICER'
      ? DEMO_USERS.placement
      : DEMO_USERS.company;

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogin = (role: UserRole, user: any) => {
    setCurrentRole(role);
  };

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage onLogin={handleLogin} />,
    },
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    // Student Workspace
    {
      path: '/student',
      element: (
        <StudentLayout
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />
      ),
      children: [
        { index: true, element: <StudentDashboard /> },
        { path: 'profile', element: <StudentProfile /> },
        { path: 'evidence', element: <StudentEvidence /> },
        { path: 'jobs', element: <JobDiscovery /> },
        { path: 'resume-studio', element: <ResumeStudio /> },
        { path: 'claim-review', element: <ResumeClaimReview /> },
        { path: 'applications', element: <ApplicationTracker /> },
      ],
    },
    // Placement Officer Workspace
    {
      path: '/placement',
      element: (
        <PlacementLayout
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />
      ),
      children: [
        { index: true, element: <PlacementDashboard /> },
        { path: 'campaigns', element: <CampaignManagement /> },
        { path: 'job-ingestion', element: <JobIngestionDedupe /> },
        { path: 'student-evidence', element: <StudentEvidenceOverview /> },
        { path: 'batch-ranking', element: <BatchRankingShortlist /> },
        { path: 'applications', element: <ApplicationStageManager /> },
      ],
    },
    // Company Recruiter Workspace
    {
      path: '/company',
      element: (
        <CompanyLayout
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />
      ),
      children: [
        { index: true, element: <CompanyDashboard /> },
        { path: 'vacancies', element: <VacancyManagement /> },
        { path: 'candidates', element: <CandidateShortlist /> },
        { path: 'pipeline', element: <InterviewPipeline /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/student" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};
