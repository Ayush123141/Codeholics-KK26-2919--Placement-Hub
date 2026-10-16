import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { UserRole, UserProfile } from '@/types';
import { DEMO_USERS } from '@/lib/api/demoData';
import { useAuth } from '@/lib/auth/AuthContext';

// Auth & Public Pages
import { LoginSelectionPage } from '@/pages/auth/LoginSelectionPage';
import { StudentLoginPage } from '@/pages/auth/StudentLoginPage';
import { PlacementLoginPage } from '@/pages/auth/PlacementLoginPage';
import { StudentRegisterPage } from '@/pages/auth/StudentRegisterPage';
import { PublicVacanciesPage } from '@/pages/public/PublicVacanciesPage';

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
import { StudentAssessments } from '@/features/student/StudentAssessments';

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

export const AppRouter: React.FC = () => {
  const { user, role, switchRole } = useAuth();

  const currentRole: UserRole = role || 'STUDENT';

  const currentUser: UserProfile =
    user ||
    (currentRole === 'STUDENT'
      ? DEMO_USERS.student
      : currentRole === 'PLACEMENT_OFFICER'
      ? DEMO_USERS.placement
      : DEMO_USERS.company);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/student" replace />,
    },
    // Public & Auth Routes
    {
      path: '/login',
      element: <LoginSelectionPage />,
    },
    {
      path: '/login/student',
      element: <StudentLoginPage />,
    },
    {
      path: '/login/placement',
      element: <PlacementLoginPage />,
    },
    {
      path: '/register',
      element: <StudentRegisterPage />,
    },
    {
      path: '/vacancies',
      element: <PublicVacanciesPage />,
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
        { path: 'assessments', element: <StudentAssessments /> },
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
