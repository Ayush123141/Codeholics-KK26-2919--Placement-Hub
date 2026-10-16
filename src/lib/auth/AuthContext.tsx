import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '@/types';
import { DEMO_USERS } from '@/lib/api/demoData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole | null;
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, targetRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  registerStudent: (data: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'proofhire_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    // Default to student demo user for smooth evaluation
    return DEMO_USERS.student;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (
    email: string,
    pass: string,
    targetRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // If live Supabase is configured, attempt real auth
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        // Fetch user profile from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || 'STUDENT';

        // Enforce role authorization
        if (role !== targetRole) {
          await supabase.auth.signOut();
          setIsLoading(false);
          return {
            success: false,
            error: `Access Denied: This account is registered as a ${role.replace('_', ' ')}. You cannot log in through the ${targetRole.replace('_', ' ')} portal.`,
          };
        }

        const user: UserProfile = {
          id: data.user.id,
          name: profile?.full_name || email.split('@')[0],
          email: data.user.email || email,
          role,
          college: profile?.college || 'TechSummit Institute of Technology',
          degree: profile?.degree || 'B.Tech in Computer Science',
          department: profile?.department || 'Computer Science',
          graduationYear: profile?.cohort_year || 2026,
          cgpa: profile?.cgpa || 8.85,
        };

        setCurrentUser(user);
        setIsLoading(false);
        return { success: true };
      }

      // Offline / Hackathon Demo Authentication
      // Simulated role accounts:
      const studentEmails = ['student@proofhire.edu', 'alex.morgan@techsummit.edu', 'alex.chen@proofhire.edu', 'student'];
      const officerEmails = ['officer@proofhire.edu', 'placements@techsummit.edu', 'ramesh@proofhire.edu', 'officer'];
      const recruiterEmails = ['recruiter@cloudscale.io', 'sarah@cloudscale.io', 'recruiter'];

      const normEmail = email.toLowerCase().trim();

      // Check role mismatch
      if (targetRole === 'STUDENT' && officerEmails.some(e => normEmail.includes(e))) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Role Mismatch: This is a Placement Officer account. Please use the Placement Officer Login page.',
        };
      }

      if (targetRole === 'PLACEMENT_OFFICER' && studentEmails.some(e => normEmail.includes(e))) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Access Denied: Student accounts cannot access the Placement Officer administration workspace.',
        };
      }

      if (targetRole === 'STUDENT') {
        const studentUser: UserProfile = {
          ...DEMO_USERS.student,
          email: normEmail.includes('@') ? normEmail : 'alex.morgan@techsummit.edu',
        };
        setCurrentUser(studentUser);
        setIsLoading(false);
        return { success: true };
      }

      if (targetRole === 'PLACEMENT_OFFICER') {
        const officerUser: UserProfile = {
          ...DEMO_USERS.placement,
          email: normEmail.includes('@') ? normEmail : 'placements@techsummit.edu',
        };
        setCurrentUser(officerUser);
        setIsLoading(false);
        return { success: true };
      }

      if (targetRole === 'COMPANY_RECRUITER') {
        const recruiterUser: UserProfile = {
          ...DEMO_USERS.company,
          email: normEmail.includes('@') ? normEmail : 's.jenkins@cloudscale.io',
        };
        setCurrentUser(recruiterUser);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid credentials or role specified.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication error occurred.' };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const registerStudent = async (data: Partial<UserProfile> & { password?: string }) => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: `student-${Date.now()}`,
        name: data.name || 'New Student',
        email: data.email || 'student@proofhire.edu',
        role: 'STUDENT',
        college: data.college || 'TechSummit Institute of Technology',
        degree: data.degree || 'B.Tech in Computer Science & Engineering',
        department: data.department || 'Computer Science',
        graduationYear: data.graduationYear || 2026,
        cgpa: data.cgpa || 8.5,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      };

      setCurrentUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'STUDENT') setCurrentUser(DEMO_USERS.student);
    else if (newRole === 'PLACEMENT_OFFICER') setCurrentUser(DEMO_USERS.placement);
    else setCurrentUser(DEMO_USERS.company);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || null,
        user: currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        switchRole,
        registerStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
