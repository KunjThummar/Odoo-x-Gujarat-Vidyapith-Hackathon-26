import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const pwdRules = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: v => /[a-z]/.test(v) },
  { label: 'One number', test: v => /\d/.test(v) },
  { label: 'One special character', test: v => /[@$!%*?&]/.test(v) },
];

export default function RegisterDriver() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', licenseNumber: '', licenseExpiry: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone validation
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    const allPassed = pwdRules.every(r => r.test(form.password));
    if (!allPassed) { setError('Password does not meet all requirements'); return; }

    setLoading(true);
    try {
      await api.post('/auth/register-driver', form);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800">FleetFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Driver Registration</h2>
          <p className="text-slate-500 text-sm mb-6">Create your driver account</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="John Smith"
                value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="john@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" placeholder="1234567890" maxLength="10"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="form-input pr-10" placeholder="Fleet@123"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {pwdRules.map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-xs ${r.test(form.password) ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${r.test(form.password) ? 'bg-green-100 border-green-400' : 'border-slate-300'}`}>
                        {r.test(form.password) && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="form-label">License Number</label>
              <input type="text" className="form-input" placeholder="DL-XXXXXX"
                value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">License Expiry Date</label>
              <input type="date" className="form-input"
                value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? 'Registering...' : 'Create Driver Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already registered? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
