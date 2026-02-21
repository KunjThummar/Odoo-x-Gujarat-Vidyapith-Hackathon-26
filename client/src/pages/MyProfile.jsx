import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const roleLabels = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'DRIVER') {
      axios.get('/api/drivers/my-profile').then(r => setProfile(r.data)).finally(() => setLoading(false));
    } else {
      setProfile(user);
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  const completedTrips = profile?.trips?.filter(t => t.status === 'COMPLETED').length || 0;
  const totalTrips = profile?.trips?.length || 0;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
        <p className="text-sm text-slate-500 mt-0.5">Your account information and performance summary</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-3xl font-bold flex-shrink-0">
            {profile?.fullName?.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800">{profile?.fullName}</h3>
            <p className="text-slate-500 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold">
                {roleLabels[profile?.role]}
              </span>
              <span className="text-xs text-slate-400">Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver-specific info */}
      {user?.role === 'DRIVER' && profile?.driver && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-brand-600">{profile.driver.totalTrips || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Total Trips</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-green-600">{completedTrips}</p>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
            </div>
            <div className="card text-center py-4">
              <p className={`text-2xl font-bold ${profile.driver.safetyScore >= 80 ? 'text-green-600' : profile.driver.safetyScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                {profile.driver.safetyScore}
              </p>
              <p className="text-xs text-slate-500 mt-1">Safety Score</p>
            </div>
            <div className="card text-center py-4">
              <StatusBadge status={profile.driver.status} />
              <p className="text-xs text-slate-500 mt-2">Duty Status</p>
            </div>
          </div>

          {/* License Info */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">License Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">License Number</p>
                <p className="font-mono font-semibold text-slate-700">{profile.driver.licenseNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Expiry Date</p>
                <p className={`font-semibold ${new Date(profile.driver.licenseExpiry) < new Date() ? 'text-red-500' : 'text-slate-700'}`}>
                  {new Date(profile.driver.licenseExpiry).toLocaleDateString('en-IN')}
                  {new Date(profile.driver.licenseExpiry) < new Date() && ' ⚠️ EXPIRED'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          {profile.trips && profile.trips.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">My Trips</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-th">Trip ID</th>
                      <th className="table-th">Route</th>
                      <th className="table-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.trips.slice(0, 10).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="table-td font-mono text-xs">#{t.id}</td>
                        <td className="table-td">{t.origin} → {t.destination}</td>
                        <td className="table-td"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Non-driver info */}
      {user?.role !== 'DRIVER' && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-700">{profile?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <span className="text-sm text-slate-500">Role</span>
              <span className="text-sm font-semibold text-brand-600">{roleLabels[profile?.role]}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500">Access Level</span>
              <span className="text-sm text-slate-700">
                {user?.role === 'FLEET_MANAGER' ? 'Full System Access' :
                  user?.role === 'DISPATCHER' ? 'Trip & Vehicle Operations' :
                    user?.role === 'FINANCIAL_ANALYST' ? 'Analytics & Financial Reports' :
                      'Safety & Compliance'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
