import React from 'react';
import { UserRole, UserProfile } from '@/types';
import { RoleSwitcher } from './RoleSwitcher';
import { ShieldCheck, Menu, Bell } from 'lucide-react';

export interface HeaderProps {
  currentUser: UserProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Brand & Mobile menu button */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-brand-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                ProofHire
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-900 text-slate-100 uppercase tracking-wider">
                PS6 Hub
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">
              Verifiable Evidence & Placement Operations
            </p>
          </div>
        </div>
      </div>

      {/* Role Switcher & Persona Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Card */}
        <div className="flex items-center gap-2.5">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium truncate max-w-[140px]">
              {currentUser.role === 'STUDENT'
                ? currentUser.degree
                : currentUser.role === 'PLACEMENT_OFFICER'
                ? 'Placement Lead'
                : currentUser.companyName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
