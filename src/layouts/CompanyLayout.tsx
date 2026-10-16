import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole, UserProfile } from '@/types';

interface CompanyLayoutProps {
  currentUser: UserProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div className="flex-1 flex">
        <Sidebar
          role="COMPANY_RECRUITER"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
