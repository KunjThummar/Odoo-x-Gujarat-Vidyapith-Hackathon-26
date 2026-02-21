import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { vehicleId: '', driverId: '', liters: '', costPerLiter: '', odometer: '', date: new Date().toISOString().split('T')[0] };

export default function FuelLogs() {
  const { user } = useAuth();
  const canCreate = ['FLEET_MANAGER', 'DISPATCHER'].includes(user?.role);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [lr, vr, dr] = await Promise.all([
        api.get('/fuel'),
        api.get('/vehicles'),
        api.get('/drivers')
      ]);
      setLogs(lr.data);
      setVehicles(vr.data);
      setDrivers(dr.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalCost = logs.reduce((s, l) => s + l.totalCost, 0);
  const totalLiters = logs.reduce((s, l) => s + l.liters, 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editing) await api.put(`/fuel/${editing.id}`, form);
      else await api.post('/fuel', form);
      setShowForm(false); setForm(emptyForm); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const openEdit = (log) => {
    setEditing(log);
    setForm({
      vehicleId: log.vehicleId,
      driverId: log.driverId || '',
      liters: log.liters,
      costPerLiter: log.costPerLiter,
      odometer: log.odometer || '',
      date: new Date(log.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fuel log?')) return;
    try { await api.delete(`/fuel/${id}`); load(); } catch { }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Fuel Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track fuel consumption across your fleet</p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowForm(true); setError(''); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Fuel Log
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Fuel Logs</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-blue-600">{totalLiters.toFixed(1)} L</p>
          <p className="text-xs text-slate-500 mt-1">Total Liters</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-red-500">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-500 mt-1">Total Fuel Cost</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editing ? 'Edit Fuel Log' : 'Add Fuel Log'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}
              <div>
                <label className="form-label">Vehicle</label>
                <select className="form-input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleName} — {v.licensePlate}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Driver (Optional)</label>
                <select className="form-input" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                  <option value="">-- Select Driver --</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Liters Filled</label>
                  <input type="number" step="0.1" className="form-input" placeholder="45.5" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Cost / Liter (₹)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="95.50" value={form.costPerLiter} onChange={e => setForm({ ...form, costPerLiter: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Odometer (km)</label>
                  <input type="number" className="form-input" placeholder="45000" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              {form.liters && form.costPerLiter && (
                <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                  <strong>Total Cost: ₹{(parseFloat(form.liters) * parseFloat(form.costPerLiter)).toFixed(2)}</strong>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update Fuel Log' : 'Add Fuel Log'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Fuel History</h3>
        </div>
        {loading ? (
          <div className="py-8"><LoadingSpinner text="Fetching fuel logs..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th text-left">Vehicle Name</th>
                  <th className="table-th text-left">Driver</th>
                  <th className="table-th text-right">Distance (km)</th>
                  <th className="table-th text-right text-red-600">Fuel Expense</th>
                  <th className="table-th text-right">Liters</th>
                  <th className="table-th text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={6} className="table-td text-center py-10 text-slate-400">No fuel logs yet</td></tr>}
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td font-medium">{log.vehicle?.vehicleName}</td>
                    <td className="table-td">{log.driver?.fullName || '—'}</td>
                    <td className="table-td text-right">{log.odometer ? `${log.odometer.toLocaleString()} km` : '—'}</td>
                    <td className="table-td text-right font-semibold text-slate-700">₹{log.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="table-td text-right">{log.liters} L</td>
                    <td className="table-td">
                      <div className="flex justify-end gap-2 pr-2">
                        <button onClick={() => openEdit(log)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(log.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
