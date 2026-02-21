import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Drivers() {
  const { user } = useAuth();
  const isManager = user?.role === 'FLEET_MANAGER';
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ safetyScore: '', status: 'On Duty', licenseExpiry: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const load = (query = '') => {
    setLoading(true);
    api.get(`/drivers?search=${query}`).then(r => setDrivers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      load(search);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/drivers/${editing.id}`, form);
      setEditing(null); load(search);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this driver?')) return;
    try { await api.delete(`/drivers/${id}`); load(search); } catch (err) { alert('Error removing driver'); }
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ safetyScore: d.driver?.safetyScore || 100, status: d.driver?.status || 'On Duty', licenseExpiry: d.driver?.licenseExpiry?.split('T')[0] || '' });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Driver Performance & Safety Profiles</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor driver licenses, safety scores, and duty status</p>
        </div>
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: drivers.length, color: 'text-slate-800' },
          { label: 'On Duty', value: drivers.filter(d => d.driver?.status === 'On Duty').length, color: 'text-green-600' },
          { label: 'On Break', value: drivers.filter(d => d.driver?.status === 'On Break').length, color: 'text-amber-600' },
          { label: 'Suspended', value: drivers.filter(d => d.driver?.status === 'Suspended').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Edit Driver — {editing.fullName}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="px-6 py-5 space-y-4">
              <div>
                <label className="form-label">Safety Score (0-100)</label>
                <input type="number" min="0" max="100" className="form-input" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Duty Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>On Duty</option>
                  <option>On Break</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div>
                <label className="form-label">License Expiry</label>
                <input type="date" className="form-input" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : 'Update Driver'}</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Driver Roster</h3>
        </div>
        {loading ? (
          <div className="py-8 text-center"><LoadingSpinner text="Fetching driver roster..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">License#</th>
                  <th className="table-th">Expiry</th>
                  <th className="table-th">Completion Rate</th>
                  <th className="table-th">Safety Score</th>
                  <th className="table-th">Min. Repairs</th>
                  <th className="table-th">Duty Status</th>
                  {isManager && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 && <tr><td colSpan={8} className="table-td text-center py-10 text-slate-400">No drivers registered yet</td></tr>}
                {drivers.map(d => {
                  const expiry = d.driver?.licenseExpiry ? new Date(d.driver.licenseExpiry) : null;
                  const expired = expiry && expiry < new Date();
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                            {d.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{d.fullName}</div>
                            <div className="text-xs text-slate-400">{d.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-mono text-xs">{d.driver?.licenseNumber || '—'}</td>
                      <td className="table-td">
                        <span className={`text-xs font-medium ${expired ? 'text-red-500' : 'text-slate-600'}`}>
                          {expiry ? expiry.toLocaleDateString('en-IN') : '—'}
                          {expired && ' ⚠️'}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${d.driver?.completionRate || 0}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-600">{d.driver?.completionRate || 0}%</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={`font-semibold text-sm ${(d.driver?.safetyScore || 0) >= 80 ? 'text-green-600' : (d.driver?.safetyScore || 0) >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                          {d.driver?.safetyScore || 0}
                        </span>
                      </td>
                      <td className="table-td text-slate-600">{d.driver?.totalTrips || 0}</td>
                      <td className="table-td"><StatusBadge status={d.driver?.status || 'On Duty'} /></td>
                      {isManager && (
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(d)} className="text-slate-500 hover:text-brand-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
