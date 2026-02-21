import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { vehicleId: '', issue: '', service: '', cost: '', date: new Date().toISOString().split('T')[0] };

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [logsRes, vRes] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
      setLogs(logsRes.data);
      setVehicles(vRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editing) await api.put(`/maintenance/${editing.id}`, form);
      else await api.post('/maintenance', form);
      setShowForm(false); setForm(emptyForm); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const openEdit = (log) => {
    setEditing(log);
    setForm({
      vehicleId: log.vehicleId,
      issue: log.issue,
      service: log.service,
      cost: log.cost,
      date: new Date(log.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleComplete = async (id) => {
    try { await api.put(`/maintenance/${id}/complete`); load(); }
    catch (err) { alert('Error marking complete'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    try { await api.delete(`/maintenance/${id}`); load(); } catch { }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Maintenance & Service Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">Keep your fleet healthy and roadworthy</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Service Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Service Logs', value: logs.length },
          { label: 'Active / In Progress', value: logs.filter(l => !l.completed).length },
          { label: 'Completed', value: logs.filter(l => l.completed).length },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editing ? 'Edit Service Log' : 'New Service Log'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}
              <div>
                <label className="form-label">Vehicle Name</label>
                <select className="form-input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleName} — {v.licensePlate}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Issue / Service Required</label>
                <input className="form-input" placeholder="Engine overheating" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Service / Work Done</label>
                <input className="form-input" placeholder="Engine oil change and coolant flush" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Cost (₹)</label>
                  <input type="number" className="form-input" placeholder="5000" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg">⚠️ Adding this log will automatically set the vehicle status to <strong>In Shop</strong>.</p>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Creating...' : 'Create Log'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Service History</h3>
        </div>
        {loading ? (
          <div className="py-8"><LoadingSpinner text="Fetching maintenance records..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Log ID</th>
                  <th className="table-th">Vehicle</th>
                  <th className="table-th">Issue / Service</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Cost</th>
                  <th className="table-th">Completed</th>
                  <th className="table-th text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={7} className="table-td text-center py-10 text-slate-400">No maintenance logs yet</td></tr>}
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td font-mono text-xs text-slate-500">#{log.id.toString().padStart(3, '0')}</td>
                    <td className="table-td font-medium">{log.vehicle?.vehicleName}</td>
                    <td className="table-td">
                      <div className="text-sm font-medium text-slate-700">{log.issue}</div>
                      <div className="text-xs text-slate-400">{log.service}</div>
                    </td>
                    <td className="table-td text-sm">{new Date(log.date).toLocaleDateString('en-IN')}</td>
                    <td className="table-td font-semibold">₹{log.cost.toLocaleString('en-IN')}</td>
                    <td className="table-td">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${log.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {log.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        {!log.completed && (
                          <button onClick={() => handleComplete(log.id)} className="text-xs py-1 px-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors">
                            Complete
                          </button>
                        )}
                        <button onClick={() => openEdit(log)} className="p-1 text-slate-400 hover:text-brand-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(log.id)} className="p-1 text-slate-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
