import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole, UserProfile } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { DEMO_USERS } from '@/lib/api/demoData';

export interface StudentLayoutProps {
  currentUser?: UserProfile;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const StudentLayout: React.FC<StudentLayoutProps> = (props) => {
  const { user, role, switchRole } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentUser = props.currentUser || user || DEMO_USERS.student;
  const currentRole = props.currentRole || role || 'STUDENT';
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
          role="STUDENT"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
