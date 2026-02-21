import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const KpiCard = ({ label, value, icon, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-0.5">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
    </div>
  );

  const { kpis, recentTrips } = data || {};

  const managerKpis = [
    { label: 'Active Fleet', value: kpis?.activeFleet, color: 'bg-blue-50', icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" /></svg> },
    { label: 'Maintenance Alert', value: kpis?.inMaintenance, color: 'bg-amber-50', icon: <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, sub: 'Vehicles in shop' },
    { label: 'Utilization Rate', value: `${kpis?.utilizationRate}%`, color: 'bg-green-50', icon: <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { label: 'Pending Shipments', value: kpis?.pendingShipments, color: 'bg-purple-50', icon: <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg> },
    { label: 'Operational Cost', value: `₹${(kpis?.operationalCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'bg-red-50', icon: <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className="space-y-6">
      {/* Role banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-5 text-white">
        <h2 className="text-xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.fullName?.split(' ')[0]}! 👋</h2>
        <p className="text-blue-100 text-sm mt-1">
          {user?.role === 'FLEET_MANAGER' && "Here's your fleet overview for today."}
          {user?.role === 'DISPATCHER' && "Ready to dispatch? Here's what's pending."}
          {user?.role === 'DRIVER' && "Your trips and assignments are below."}
          {user?.role === 'SAFETY_OFFICER' && "Monitor driver safety and vehicle maintenance."}
          {user?.role === 'FINANCIAL_ANALYST' && "Track operational costs and fleet ROI."}
        </p>
      </div>

      {/* KPIs */}
      {(user?.role === 'FLEET_MANAGER' || user?.role === 'DISPATCHER' || user?.role === 'FINANCIAL_ANALYST') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {managerKpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>
      )}

      {(user?.role === 'DRIVER' || user?.role === 'SAFETY_OFFICER') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total Vehicles" value={kpis?.totalVehicles} color="bg-blue-50" icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" /></svg>} />
          <KpiCard label="In Maintenance" value={kpis?.inMaintenance} color="bg-amber-50" icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <KpiCard label="Total Drivers" value={kpis?.totalDrivers} color="bg-green-50" icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <KpiCard label="Pending Trips" value={kpis?.pendingShipments} color="bg-purple-50" icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" /></svg>} />
        </div>
      )}

      {/* Recent Trips Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">
            {user?.role === 'DRIVER' ? 'My Trips & Available Trips' : 'Recent Trips'}
          </h3>
          <span className="text-xs text-slate-400">{recentTrips?.length} trips</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Trip ID</th>
                <th className="table-th">Vehicle</th>
                <th className="table-th">Driver</th>
                <th className="table-th">Origin → Dest</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips?.length === 0 && (
                <tr><td colSpan={5} className="table-td text-center text-slate-400 py-8">No trips found</td></tr>
              )}
              {recentTrips?.map(trip => (
                <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-td font-mono text-xs text-slate-500">#{trip.id.toString().padStart(4, '0')}</td>
                  <td className="table-td font-medium">{trip.vehicle?.vehicleName || <span className="text-slate-400 text-xs">Unassigned</span>}</td>
                  <td className="table-td">{trip.driver?.fullName || <span className="text-slate-400 text-xs italic">Open</span>}</td>
                  <td className="table-td">
                    <span className="text-slate-600">{trip.origin}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="text-slate-600">{trip.destination}</span>
                  </td>
                  <td className="table-td"><StatusBadge status={trip.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
