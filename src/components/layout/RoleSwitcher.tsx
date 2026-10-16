import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { Users, GraduationCap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange, className }) => {
  const navigate = useNavigate();

  const roles: { id: UserRole; label: string; path: string; icon: React.ReactNode }[] = [
    {
      id: 'STUDENT',
      label: 'Student',
      path: '/student',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    {
      id: 'PLACEMENT_OFFICER',
      label: 'Placement Officer',
      path: '/placement',
      icon: <Users className="w-3.5 h-3.5" />,
    },
  ];

  const handleSelectRole = (role: UserRole, path: string) => {
    onRoleChange(role);
    navigate(path);
  };

  return (
    <div className={cn('flex items-center bg-slate-900/90 p-1 rounded-xl shadow-inner border border-slate-700/80', className)}>
      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 px-2 select-none hidden sm:inline">
        Persona:
      </span>
      {roles.map((r) => {
        const isActive = currentRole === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => handleSelectRole(r.id, r.path)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
              isActive
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            )}
          >
            {r.icon}
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
};
