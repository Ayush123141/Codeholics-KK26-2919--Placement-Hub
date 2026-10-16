import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthContext';

export const PlacementLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as PLACEMENT_OFFICER, automatically redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && role === 'PLACEMENT_OFFICER') {
      navigate('/placement', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    const res = await login(email, password, 'PLACEMENT_OFFICER');
    if (res.success) {
      navigate('/placement', { replace: true });
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify your administrative credentials.');
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('placements@techsummit.edu');
    setPassword('officerSecure2026!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-100/60 to-paper-alt flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft background ambient gradient glow (Deep slate/navy ink tint) */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(15, 20, 32, 0.06) 0%, transparent 68%)',
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

        {/* Officer Specific Distinct Badge */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-[10px] bg-ink text-white flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
            Placement Officer Portal
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Officer Hub Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Authorized console for campaign governance, candidate batch ranking, and job feed deduplication.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <GlassPanel className="p-7 sm:p-8 shadow-glass border-white/70 bg-white/85">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-[10px] bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <Input
              label="Institutional Staff Email"
              type="email"
              placeholder="e.g. placements@techsummit.edu"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="placement-password-input" className="block text-xs font-semibold text-slate-800">Password</label>
                <button
                  type="button"
                  onClick={() => setErrorMessage('Administrative password resets must be authorized by your Central Campus IT administrator.')}
                  className="font-mono text-[11px] text-slate-500 hover:text-ink font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="placement-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrative password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-300 rounded-[8px] text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
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

            <Button type="submit" variant="secondary" className="w-full font-bold mt-2" isLoading={isLoading}>
              Sign In to Placement Hub →
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Testing in Demo Mode?</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="font-mono text-xs font-bold text-ink hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-[6px] border border-slate-300 transition-colors"
            >
              Fill Officer Demo
            </button>
          </div>

          {/* Institutional Security Notice (Strictly NO public registration link) */}
          <div className="mt-4 p-3 bg-paper-alt rounded-[10px] border border-line text-[11px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-ink">Role Security Notice:</p>
            <p>
              Candidate accounts cannot access this administrative console. Role assignments are strictly audited in institutional database records.
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};
