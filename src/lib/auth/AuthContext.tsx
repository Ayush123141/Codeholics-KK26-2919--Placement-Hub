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
  registerStudent: (data: Partial<UserProfile> & { password?: string; skills?: string[] }) => Promise<{ success: boolean; error?: string }>;
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
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Sync Supabase Auth Session on mount and keep updated on state changes
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            const role = (profile?.role || session.user.user_metadata?.role || 'STUDENT') as UserRole;
            const user: UserProfile = {
              id: session.user.id,
              name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Candidate',
              email: session.user.email || '',
              role,
              college: profile?.college || 'TechSummit Institute of Technology',
              degree: profile?.degree || 'B.Tech in Computer Science & Engineering',
              department: profile?.department || 'Computer Science',
              graduationYear: profile?.cohort_year || 2026,
              cgpa: profile?.cgpa || 8.85,
            };
            setCurrentUser(user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session retrieval warning:', e);
        }
      }

      // Check local storage fallback if Supabase had no active session
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch {}

      setIsLoading(false);
    }

    initAuth();

    // Listen to Supabase auth events
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const role = (profile?.role || session.user.user_metadata?.role || 'STUDENT') as UserRole;
          const user: UserProfile = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Candidate',
            email: session.user.email || '',
            role,
            college: profile?.college || 'TechSummit Institute of Technology',
            degree: profile?.degree || 'B.Tech in Computer Science & Engineering',
            department: profile?.department || 'Computer Science',
            graduationYear: profile?.cohort_year || 2026,
            cgpa: profile?.cgpa || 8.85,
          };
          setCurrentUser(user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (
    email: string,
    pass: string,
    targetRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = (profile?.role || data.user.user_metadata?.role || 'STUDENT') as UserRole;

        if (role !== targetRole) {
          await supabase.auth.signOut();
          setIsLoading(false);
          return {
            success: false,
            error: `Access Denied: This account is registered as a ${role.replace('_', ' ')}. Please use the ${role === 'STUDENT' ? 'Student' : 'Placement Officer'} login portal.`,
          };
        }

        const user: UserProfile = {
          id: data.user.id,
          name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          role,
          college: profile?.college || 'TechSummit Institute of Technology',
          degree: profile?.degree || 'B.Tech in Computer Science',
          department: profile?.department || 'Computer Science',
          graduationYear: profile?.cohort_year || 2026,
          cgpa: profile?.cgpa || 8.85,
        };

        setCurrentUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setIsLoading(false);
        return { success: true };
      }

      // Offline / Demo Accounts
      const normEmail = email.toLowerCase().trim();
      const officerEmails = ['officer@proofhire.edu', 'placements@techsummit.edu', 'ramesh@proofhire.edu', 'officer'];

      if (targetRole === 'STUDENT' && officerEmails.some(e => normEmail.includes(e))) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Role Mismatch: This is a Placement Officer account. Please use the Placement Officer Login page.',
        };
      }

      if (targetRole === 'STUDENT') {
        const studentUser: UserProfile = {
          ...DEMO_USERS.student,
          email: normEmail.includes('@') ? normEmail : 'student@proofhire.edu',
        };
        setCurrentUser(studentUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
        setIsLoading(false);
        return { success: true };
      }

      if (targetRole === 'PLACEMENT_OFFICER') {
        const officerUser: UserProfile = {
          ...DEMO_USERS.placement,
          email: normEmail.includes('@') ? normEmail : 'placements@techsummit.edu',
        };
        setCurrentUser(officerUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(officerUser));
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
    sessionStorage.removeItem('proofhire_token');
    sessionStorage.removeItem('proofhire_user');
    localStorage.removeItem('proofhire_auth_session');
    localStorage.removeItem('proofhire_evidence');
    localStorage.removeItem('proofhire_student_evidence');
    localStorage.removeItem('proofhire_student_skills');
    localStorage.removeItem('proofhire_resume_skills');
  };

  const registerStudent = async (data: Partial<UserProfile> & { password?: string; skills?: string[] }) => {
    setIsLoading(true);
    const candidateEmail = (data.email || '').trim();
    const candidatePassword = data.password || 'Student@123';
    const candidateName = (data.name || '').trim();

    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Sign up directly with Supabase Auth
        let userId: string | null = null;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: candidateEmail,
          password: candidatePassword,
          options: {
            data: {
              full_name: candidateName,
              role: 'STUDENT',
              department: data.department || 'Computer Science',
              cohort_year: data.graduationYear || 2026,
            },
          },
        });

        if (authError) {
          const msg = authError.message.toLowerCase();
          // If already registered, attempt to log in with provided password
          if (msg.includes('already') || msg.includes('registered')) {
            const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
              email: candidateEmail,
              password: candidatePassword,
            });
            if (loginErr) {
              setIsLoading(false);
              return { success: false, error: `Account already exists: ${loginErr.message}` };
            }
            userId = loginData.user.id;
          } else {
            setIsLoading(false);
            return { success: false, error: authError.message };
          }
        } else if (authData?.user) {
          userId = authData.user.id;
        }

        if (userId) {
          // 2. Upsert profile directly into Supabase public.profiles
          const profilePayload = {
            id: userId,
            email: candidateEmail,
            full_name: candidateName,
            role: 'STUDENT',
            department: data.department || 'Computer Science',
            cohort_year: data.graduationYear || 2026,
            headline: `${data.degree || 'B.Tech'} - ${data.college || 'TechSummit'}`,
            updated_at: new Date().toISOString(),
          };

          try {
            await supabase.from('profiles').upsert(profilePayload);
          } catch (upsertWarn) {
            console.warn('Profile upsert notice:', upsertWarn);
          }

          // 3. Confirm profile by fetching directly from Supabase
          const { data: verifiedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          const candidateProfile: UserProfile = {
            id: userId,
            name: verifiedProfile?.full_name || candidateName,
            email: verifiedProfile?.email || candidateEmail,
            role: 'STUDENT',
            college: data.college || 'TechSummit Institute of Technology',
            degree: data.degree || 'B.Tech in Computer Science & Engineering',
            department: verifiedProfile?.department || data.department || 'Computer Science',
            graduationYear: verifiedProfile?.cohort_year || data.graduationYear || 2026,
            cgpa: data.cgpa || 8.5,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          };

          setCurrentUser(candidateProfile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(candidateProfile));
          // Reset evidence & skill cache for new student registration so registry starts fresh & dynamic
          localStorage.removeItem('proofhire_evidence');
          localStorage.removeItem('proofhire_student_evidence');
          localStorage.removeItem('proofhire_student_skills');
          localStorage.removeItem('proofhire_resume_skills');
          localStorage.setItem(`proofhire_student_evidence_${userId}`, JSON.stringify([]));
          setIsLoading(false);
          return { success: true };
        }
      }

      // Offline / Local fallback if Supabase not configured
      const fallbackUser: UserProfile = {
        id: `student-${Date.now()}`,
        name: candidateName || 'New Student',
        email: candidateEmail || 'student@proofhire.edu',
        role: 'STUDENT',
        college: data.college || 'TechSummit Institute of Technology',
        degree: data.degree || 'B.Tech in Computer Science & Engineering',
        department: data.department || 'Computer Science',
        graduationYear: data.graduationYear || 2026,
        cgpa: data.cgpa || 8.5,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      };

      setCurrentUser(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
      localStorage.removeItem('proofhire_evidence');
      localStorage.removeItem('proofhire_student_evidence');
      localStorage.setItem(`proofhire_student_evidence_${fallbackUser.id}`, JSON.stringify([]));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'STUDENT') setCurrentUser(DEMO_USERS.student);
    else setCurrentUser(DEMO_USERS.placement);
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
