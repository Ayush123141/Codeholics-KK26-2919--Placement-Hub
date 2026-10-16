import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole, UserProfile } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { DEMO_USERS } from '@/lib/api/demoData';

export interface PlacementLayoutProps {
  currentUser?: UserProfile;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const PlacementLayout: React.FC<PlacementLayoutProps> = (props) => {
  const { user, role, switchRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentUser = props.currentUser || user || DEMO_USERS.placement;
  const currentRole = props.currentRole || role || 'PLACEMENT_OFFICER';
  const onRoleChange = props.onRoleChange || switchRole;

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
          role="PLACEMENT_OFFICER"
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
