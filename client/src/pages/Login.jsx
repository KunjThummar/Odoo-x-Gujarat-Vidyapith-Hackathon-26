import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FleetFlow</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Manage your fleet<br />with confidence</h2>
          <p className="text-blue-100 text-lg leading-relaxed">Enterprise-grade fleet & logistics management system for modern businesses.</p>
          <div className="mt-12 space-y-4">
            {['Real-time fleet tracking', 'Role-based access control', 'Automated trip dispatching', 'Operational analytics'].map(f => (
              <div key={f} className="flex items-center gap-3 text-blue-100">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">FleetFlow</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to your FleetFlow account</p>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Email address</label>
                <input type="email" className="form-input" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} className="form-input pr-10" placeholder="Enter your password"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
                {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Signing in...</> : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              New driver?{' '}
              <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">Register here</Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Demo Credentials</p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between"><span className="text-slate-400">Fleet Manager:</span><span className="font-mono">manager@fleetflow.com</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Dispatcher:</span><span className="font-mono">dispatcher@fleetflow.com</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Driver:</span><span className="font-mono">john@fleetflow.com</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Password:</span><span className="font-mono font-semibold text-brand-600">Fleet@123</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
