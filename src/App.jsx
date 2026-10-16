import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MatchModal from './components/MatchModal';
import AddEvidenceModal from './components/AddEvidenceModal';
import Toast from './components/Toast';

import OverviewPage from './pages/OverviewPage';
import FindJobsPage from './pages/FindJobsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import EvidencePage from './pages/EvidencePage';
import ResumeStudioPage from './pages/ResumeStudioPage';
import PlacementInsightsPage from './pages/PlacementInsightsPage';
import SettingsPage from './pages/SettingsPage';

import {
  initialProfile,
  initialJobs,
  initialSkillsEvidence,
  initialApplications,
  recentActivities,
  placementAnalytics
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent / dynamic application state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('proofhire_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('proofhire_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem('proofhire_skills');
    return saved ? JSON.parse(saved) : initialSkillsEvidence;
  });

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('proofhire_applications');
    return saved ? JSON.parse(saved) : initialApplications;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('proofhire_activities');
    return saved ? JSON.parse(saved) : recentActivities;
  });

  const [bookmarkedJobIds, setBookmarkedJobIds] = useState(() => {
    const saved = localStorage.getItem('proofhire_bookmarks');
    return saved ? JSON.parse(saved) : ['job-1', 'job-4'];
  });

  const [appliedJobIds, setAppliedJobIds] = useState(() => {
    const saved = localStorage.getItem('proofhire_applied_ids');
    return saved ? JSON.parse(saved) : ['job-1', 'job-2', 'job-6'];
  });

  // Modals & Popups
  const [selectedMatchJob, setSelectedMatchJob] = useState(null);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('proofhire_jobs', JSON.stringify(jobs));
    localStorage.setItem('proofhire_skills', JSON.stringify(skills));
    localStorage.setItem('proofhire_applications', JSON.stringify(applications));
    localStorage.setItem('proofhire_bookmarks', JSON.stringify(bookmarkedJobIds));
    localStorage.setItem('proofhire_applied_ids', JSON.stringify(appliedJobIds));
  }, [jobs, skills, applications, bookmarkedJobIds, appliedJobIds]);

  // Recalculate verified skills stats
  useEffect(() => {
    const verified = skills.filter((s) => s.status === 'Verified' || s.status === 'Evidence found').length;
    setProfile((prev) => ({
      ...prev,
      verifiedSkillsCount: verified,
      profileStrength: Math.min(98, Math.round((verified / prev.totalSkillsCount) * 100))
    }));
  }, [skills]);

  // Handlers
  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  const handleBookmarkToggle = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    const isBookmarked = bookmarkedJobIds.includes(jobId);

    if (isBookmarked) {
      setBookmarkedJobIds((prev) => prev.filter((id) => id !== jobId));
      showToast({
        type: 'info',
        title: 'Job Removed from Saved',
        message: `${job?.title || 'Job'} removed from your bookmarks.`
      });
    } else {
      setBookmarkedJobIds((prev) => [...prev, jobId]);
      showToast({
        type: 'success',
        title: 'Job Saved to Bookmarks',
        message: `${job?.title || 'Job'} at ${job?.company} is saved for quick access.`
      });
    }
  };

  const handleApplyJob = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (appliedJobIds.includes(jobId)) {
      showToast({
        type: 'warning',
        title: 'Already Applied',
        message: `You have already submitted an evidence-backed application to ${job.company}.`
      });
      return;
    }

    // Add to applied IDs
    setAppliedJobIds((prev) => [...prev, jobId]);

    // Create new application record
    const newApp = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      role: job.title,
      company: job.company,
      logo: job.logo,
      logoColor: job.logoColor,
      matchScore: job.matchScore,
      status: 'Applied',
      appliedDate: 'Just now',
      nextStep: 'Application submitted with Evidence-Backed Resume',
      verifiedSkillsCount: job.matchedSkills.length,
      notes: `Applied with verified proof for: ${job.matchedSkills.join(', ')}.`
    };

    setApplications((prev) => [newApp, ...prev]);

    // Add activity
    const newAct = {
      id: `act-${Date.now()}`,
      type: 'match',
      title: `Applied to ${job.company}`,
      description: `Truthful resume transmitted for ${job.title} (${job.matchScore}% Match).`,
      time: 'Just now',
      badge: 'Submitted'
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast({
      type: 'success',
      title: 'Application Submitted!',
      message: `Your evidence-backed resume was delivered to ${job.company} (${job.matchScore}% match).`
    });
  };

  const handleUpdateApplicationStatus = (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    showToast({
      type: 'info',
      title: 'Stage Status Updated',
      message: `Recruitment stage updated to "${newStatus}".`
    });
  };

  const handleAddEvidence = (newEvidence) => {
    const newItem = {
      id: `sk-${Date.now()}`,
      ...newEvidence
    };

    setSkills((prev) => [newItem, ...prev]);

    // Add activity
    const newAct = {
      id: `act-${Date.now()}`,
      type: 'evidence',
      title: `Evidence added for ${newEvidence.skill}`,
      description: `${newEvidence.sourceName} submitted and queued for verification.`,
      time: 'Just now',
      badge: 'Verified'
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast({
      type: 'success',
      title: 'Evidence Added!',
      message: `${newEvidence.skill} evidence was logged and verified. Profile score updated!`
    });
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('proofhire_profile');
    localStorage.removeItem('proofhire_jobs');
    localStorage.removeItem('proofhire_skills');
    localStorage.removeItem('proofhire_applications');
    localStorage.removeItem('proofhire_activities');
    localStorage.removeItem('proofhire_bookmarks');
    localStorage.removeItem('proofhire_applied_ids');

    setProfile(initialProfile);
    setJobs(initialJobs);
    setSkills(initialSkillsEvidence);
    setApplications(initialApplications);
    setActivities(recentActivities);
    setBookmarkedJobIds(['job-1', 'job-4']);
    setAppliedJobIds(['job-1', 'job-2', 'job-6']);

    showToast({
      type: 'info',
      title: 'Demo State Reset',
      message: 'All mock applications and evidence have been restored to default.'
    });
  };

  // Keyboard shortcut for Cmd/Ctrl + K search focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('header input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNav
          activeTab={activeTab}
          setMobileOpen={setMobileOpen}
          onOpenAddEvidence={() => setIsAddEvidenceOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewPage
              profile={profile}
              jobs={jobs}
              skills={skills}
              applications={applications}
              activities={activities}
              onNavigate={setActiveTab}
              onOpenMatchModal={(job) => setSelectedMatchJob(job)}
              onOpenAddEvidence={() => setIsAddEvidenceOpen(true)}
            />
          )}

          {activeTab === 'find-jobs' && (
            <FindJobsPage
              jobs={jobs}
              onOpenMatchModal={(job) => setSelectedMatchJob(job)}
              onApply={handleApplyJob}
              onBookmark={handleBookmarkToggle}
              bookmarkedJobIds={bookmarkedJobIds}
              appliedJobIds={appliedJobIds}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsPage
              applications={applications}
              onUpdateStatus={handleUpdateApplicationStatus}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidencePage
              skills={skills}
              onOpenAddEvidence={() => setIsAddEvidenceOpen(true)}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeStudioPage
              profile={profile}
              skills={skills}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'placement' && (
            <PlacementInsightsPage
              analytics={placementAnalytics}
              jobs={jobs}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              profile={profile}
              onResetDemoData={handleResetDemoData}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Hackathon Demo Footer (hidden when printing) */}
        <footer className="px-6 py-4 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ProofHire</span>
            <span>—</span>
            <span>AI-Assisted Evidence-First Placement Hub</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">
              DEMO DATA
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Engineered for Campus Recruitment & Verifiable Competency Auditing.
          </p>
        </footer>
      </div>

      {/* Match Explanation Modal */}
      {selectedMatchJob && (
        <MatchModal
          job={selectedMatchJob}
          onClose={() => setSelectedMatchJob(null)}
          onApply={handleApplyJob}
          onBookmark={handleBookmarkToggle}
          isBookmarked={bookmarkedJobIds.includes(selectedMatchJob.id)}
          isApplied={appliedJobIds.includes(selectedMatchJob.id)}
        />
      )}

      {/* Add Evidence Modal */}
      <AddEvidenceModal
        isOpen={isAddEvidenceOpen}
        onClose={() => setIsAddEvidenceOpen(false)}
        onAddEvidence={handleAddEvidence}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
