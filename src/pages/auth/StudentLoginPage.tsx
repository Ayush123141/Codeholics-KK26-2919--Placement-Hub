import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthContext';

export const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as STUDENT, automatically redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && role === 'STUDENT') {
      navigate('/student', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const res = await login(email, password, 'STUDENT');
    if (res.success) {
      navigate('/student', { replace: true });
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('student@proofhire.edu');
    setPassword('demoPass123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-paper-alt flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft background ambient gradient glow */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 163, 0, 0.10) 0%, transparent 68%)',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 hover:text-ink mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to portal selection</span>
        </Link>

        {/* Student Specific Distinct Badge */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-[10px] bg-brand-500 text-ink flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-800 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Student Portal
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Candidate Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Access your verified skill evidence ledger, job fit matches, and tailored ATS resume studio.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <GlassPanel className="p-7 sm:p-8 shadow-glass border-white/70 bg-white/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-[10px] bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <Input
              label="Campus Institutional Email"
              type="email"
              placeholder="e.g. student@proofhire.edu"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="student-password-input" className="block text-xs font-semibold text-slate-800">Password</label>
                <button
                  type="button"
                  onClick={() => setErrorMessage('For account recovery, contact your college placement administrator or verify via institutional SSO.')}
                  className="font-mono text-[11px] text-brand-700 hover:text-brand-900 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="student-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-300 rounded-[8px] text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full font-bold shadow-btn-amber mt-2" isLoading={isLoading}>
              Sign In to Candidate Account →
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Testing in Demo Mode?</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="font-mono text-xs font-bold text-brand-800 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-[6px] border border-brand-200 transition-colors"
            >
              Fill Student Demo
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-700 hover:text-brand-900 transition-colors">
                Register with resume extraction →
              </Link>
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};
