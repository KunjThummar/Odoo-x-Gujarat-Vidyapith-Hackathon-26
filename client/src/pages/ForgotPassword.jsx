import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const sendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('OTP sent! Check the server console for the OTP (dev mode).');
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
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
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Forgot Password</h2>
          <p className="text-slate-500 text-sm mb-6">
            {step === 1 ? "Enter your email to receive a reset OTP" : "Enter the 6-digit OTP sent to your email"}
          </p>

          {error && <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">{success}</div>}

          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="form-label">One-Time Password (OTP)</label>
                <input type="text" className="form-input text-center text-2xl tracking-[0.5em] font-bold" placeholder="000000"
                  maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} required />
                <p className="text-xs text-slate-400 mt-1.5">Check the server console for OTP (development mode)</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }} className="btn-secondary w-full justify-center">
                Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            <Link to="/login" className="text-brand-600 font-medium">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
