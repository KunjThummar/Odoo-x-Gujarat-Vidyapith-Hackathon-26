import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const pwdRules = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: v => /[a-z]/.test(v) },
  { label: 'One number', test: v => /\d/.test(v) },
  { label: 'One special character', test: v => /[@$!%*?&]/.test(v) },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!pwdRules.every(r => r.test(password))) { setError('Password does not meet requirements'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { email: state?.email, otp: state?.otp, newPassword: password });
      navigate('/login');
    } catch (err) { setError(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" /></svg>
          </div>
          <span className="text-xl font-bold text-slate-800">FleetFlow</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h2>
          <p className="text-slate-500 text-sm mb-6">Create a strong new password</p>
          {error && <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Fleet@123"
                value={password} onChange={e => setPassword(e.target.value)} required />
              {password && (
                <div className="mt-2 space-y-1">
                  {pwdRules.map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-xs ${r.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${r.test(password) ? 'bg-green-100 border-green-400' : 'border-slate-300'}`}>
                        {r.test(password) && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            <Link to="/login" className="text-brand-600 font-medium">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
