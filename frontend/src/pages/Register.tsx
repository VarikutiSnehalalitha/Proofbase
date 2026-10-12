import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/ui';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, username.toLowerCase().trim());
      toastSuccess('Account created successfully! Welcome to Proofbase.');
      navigate('/');
    } catch (err: any) {
      toastError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 animate-fadeIn">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create your portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Showcase verified proof-of-work to recruiters & engineering leaders
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Username (Portfolio handle)"
              type="text"
              placeholder="e.g. sarahc"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              hint="Your shareable URL: proofbase.com/p/username"
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Free Portfolio</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
