import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Auth & Public Pages
import { LoginSelectionPage } from '@/pages/auth/LoginSelectionPage';
import { StudentLoginPage } from '@/pages/auth/StudentLoginPage';
import { PlacementLoginPage } from '@/pages/auth/PlacementLoginPage';
import { StudentRegisterPage } from '@/pages/auth/StudentRegisterPage';
import { PublicVacanciesPage } from '@/pages/public/PublicVacanciesPage';
import { LandingPage } from '@/pages/public/LandingPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Layouts
import { StudentLayout } from '@/layouts/StudentLayout';
import { PlacementLayout } from '@/layouts/PlacementLayout';

// Student Portal Pages
import { StudentDashboard } from '@/features/student/StudentDashboard';
import { StudentProfile } from '@/features/student/StudentProfile';
import { StudentAssessments } from '@/features/student/StudentAssessments';
import { StudentEvidence } from '@/features/student/StudentEvidence';
import { JobDiscovery } from '@/features/student/JobDiscovery';
import { ResumeStudio } from '@/features/student/ResumeStudio';
import { ApplicationTracker } from '@/features/student/ApplicationTracker';

// Placement Officer Pages
import { PlacementDashboard } from '@/features/placement/PlacementDashboard';
import { CampaignManagement } from '@/features/placement/CampaignManagement';
import { JobIngestionDedupe } from '@/features/placement/JobIngestionDedupe';
import { StudentEvidenceOverview } from '@/features/placement/StudentEvidenceOverview';
import { BatchRankingShortlist } from '@/features/placement/BatchRankingShortlist';
import { ApplicationStageManager } from '@/features/placement/ApplicationStageManager';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
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
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'profile', element: <StudentProfile /> },
      { path: 'assessments', element: <StudentAssessments /> },
      { path: 'evidence', element: <StudentEvidence /> },
      { path: 'jobs', element: <JobDiscovery /> },
      { path: 'resume-studio', element: <ResumeStudio /> },
      { path: 'claim-review', element: <Navigate to="/student/evidence" replace /> },
      { path: 'applications', element: <ApplicationTracker /> },
    ],
  },
  // Placement Officer Workspace
  {
    path: '/placement',
    element: <PlacementLayout />,
    children: [
      { index: true, element: <PlacementDashboard /> },
      { path: 'campaigns', element: <CampaignManagement /> },
      { path: 'job-ingestion', element: <JobIngestionDedupe /> },
      { path: 'student-evidence', element: <StudentEvidenceOverview /> },
      { path: 'batch-ranking', element: <BatchRankingShortlist /> },
      { path: 'applications', element: <ApplicationStageManager /> },
    ],
  },
  // Redirect legacy /company attempts to placement workspace
  {
    path: '/company/*',
    element: <Navigate to="/placement" replace />,
  },
  {
    path: '/company',
    element: <Navigate to="/placement" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
