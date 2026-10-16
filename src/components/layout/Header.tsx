import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, UserProfile } from '@/types';
import { ShieldCheck, Menu, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';

export interface HeaderProps {
  currentUser?: UserProfile | null;
  currentRole?: UserRole | null;
  onRoleChange?: (role: UserRole) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onToggleSidebar,
}) => {
  const { logout, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const activeUser = currentUser || authUser;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-line h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Brand & Mobile menu button */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-ink rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[8px] bg-brand-500 flex items-center justify-center text-ink shadow-xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-ink group-hover:text-brand-600 transition-colors">
                Proof<span className="text-brand-600">Hire</span>
              </span>
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-paper-alt text-slate-700 uppercase tracking-wider border border-line">
                Placement Hub
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">
              Evidence-Based Recruitment & Skill Verification
            </p>
          </div>
        </Link>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Public Vacancies link */}
        <Link
          to="/vacancies"
          className="font-mono text-xs font-semibold text-slate-600 hover:text-ink hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>Explore Vacancies</span>
        </Link>

        {isAuthenticated && activeUser ? (
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-line">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-ink leading-none">{activeUser.name}</p>
                <span className="font-mono text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 inline-block mt-0.5">
                  {activeUser.role.replace('_', ' ')}
                </span>
              </div>
              <img
                src={activeUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={activeUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300"
              />
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs font-bold"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              className="text-xs font-bold shadow-btn-amber"
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
