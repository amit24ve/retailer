import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = [
  { role: 'Super Admin', email: 'admin@retailcrm.io', password: 'admin123' },
  { role: 'Brand Owner', email: 'brandowner@fashionbrand.io', password: 'brand123' },
  { role: 'Store Manager', email: 'manager@delhistore.io', password: 'store123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@retailcrm.io');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // Use window.location as a reliable redirect fallback
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-200/20 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-yellow-600 mb-4 shadow-lg shadow-primary-500/20">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">RetailCRM</h1>
          <p className="text-slate-500 mt-2">Enterprise Loyalty Platform</p>
        </div>

        {/* Demo credentials */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                onClick={() => fillDemo(cred)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 transition-all text-left group"
              >
                <p className="text-xs font-semibold text-slate-700 group-hover:text-primary-700 truncate">{cred.role}</p>
                <p className="text-xs text-slate-400 truncate mt-1">{cred.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sign In to Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Platform'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Protected by enterprise-grade JWT authentication
          </p>
        </div>

        {/* Version tag */}
        <p className="text-center text-xs text-slate-400 mt-6">
          RetailCRM Platform v2.0 · Enterprise Edition
        </p>
      </div>
    </div>
  );
}

