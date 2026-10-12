import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Input } from '../components/ui';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, User } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toastSuccess('Signed in successfully!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toastError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      toastSuccess(`Logged in as ${demoEmail.split('@')[0]}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toastError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 animate-fadeIn">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your verified proof-of-work portfolio
          </p>
        </div>

        {/* Demo Accounts Quick-Select */}
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Instant 1-Click Demo Accounts</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('alice@example.com')}
              disabled={loading}
              className="p-3 rounded-xl bg-white border border-indigo-100/80 hover:border-indigo-400 hover:shadow-sm text-left transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 shadow-2xs">
                A
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                Alice J.
              </div>
              <div className="text-[10px] text-slate-500 truncate">Staff Engineer</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('bob@example.com')}
              disabled={loading}
              className="p-3 rounded-xl bg-white border border-indigo-100/80 hover:border-indigo-400 hover:shadow-sm text-left transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 shadow-2xs">
                B
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                Bob M.
              </div>
              <div className="text-[10px] text-slate-500 truncate">Data Scientist</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('carol@example.com')}
              disabled={loading}
              className="p-3 rounded-xl bg-white border border-indigo-100/80 hover:border-indigo-400 hover:shadow-sm text-left transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 shadow-2xs">
                C
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-violet-600">
                Carol D.
              </div>
              <div className="text-[10px] text-slate-500 truncate">Lead Designer</div>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm border rounded-xl bg-white text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
                  fieldErrors.password
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                required
              />
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
              Create portfolio free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
