import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthContext';

export const PlacementLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    const res = await login(email, password, 'PLACEMENT_OFFICER');
    if (res.success) {
      navigate('/placement');
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to portal selection</span>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Lock className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded-full border border-slate-300">
            Institutional Administration
          </span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Placement Officer Sign In
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Authorized portal for cohort governance, job duplicate review, and batch candidate matching.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-8 shadow-sm border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
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
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
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
                  className="w-full px-3 py-2 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
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

            <Button type="submit" variant="secondary" className="w-full font-semibold" isLoading={isLoading}>
              Sign In to Placement Hub
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Evaluating Demo?</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs font-bold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300 transition-colors"
            >
              Fill Placement Lead Account
            </button>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Role Security Notice:</p>
            <p>
              Candidate accounts cannot sign in here. Role assignments are strictly audited in institutional database records.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
