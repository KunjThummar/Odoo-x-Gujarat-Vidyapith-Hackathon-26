import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const emptyForm = { vehicleName: '', model: '', licensePlate: '', type: 'Truck', maxLoadCapacity: '', odometer: '', status: 'AVAILABLE' };
const vehicleTypes = ['Mini Truck', 'Truck', 'Heavy Truck', 'Van', 'Pickup', 'Tanker'];

export default function Vehicles() {
  const { user } = useAuth();
  const isManager = user?.role === 'FLEET_MANAGER';
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const load = (query = '') => {
    setLoading(true);
    api.get(`/vehicles?search=${query}`).then(r => setVehicles(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      load(search);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (v) => { setEditing(v); setForm({ vehicleName: v.vehicleName, model: v.model, licensePlate: v.licensePlate, type: v.type, maxLoadCapacity: v.maxLoadCapacity, odometer: v.odometer, status: v.status }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editing) await api.put(`/vehicles/${editing.id}`, form);
      else await api.post('/vehicles', form);
      setShowForm(false); load(search);
    } catch (err) { setError(err.response?.data?.message || 'Error saving vehicle'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await api.delete(`/vehicles/${id}`); load(search); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Vehicle Registry</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your entire fleet inventory</p>
        </div>
        <div className="flex flex-1 items-center gap-3 justify-end">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isManager && (
            <button onClick={openNew} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Vehicles', value: vehicles.length, color: 'text-slate-800' },
          { label: 'Available', value: vehicles.filter(v => v.status === 'AVAILABLE').length, color: 'text-green-600' },
          { label: 'In Shop', value: vehicles.filter(v => v.status === 'IN_SHOP').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editing ? 'Edit Vehicle' : 'New Vehicle Registration'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="form-label">Vehicle Name</label>
                  <input className="form-input" placeholder="Tata Ace Gold" value={form.vehicleName} onChange={e => setForm({ ...form, vehicleName: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Model / Year</label>
                  <input className="form-input" placeholder="2021" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {vehicleTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label">License Plate</label>
                  <input className="form-input" placeholder="GJ-01-AA-0001" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Max Load (kg)</label>
                  <input type="number" className="form-input" placeholder="1500" value={form.maxLoadCapacity} onChange={e => setForm({ ...form, maxLoadCapacity: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Initial Odometer (km)</label>
                  <input type="number" className="form-input" placeholder="0" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} />
                </div>
                {editing && (
                  <div className="col-span-2">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="AVAILABLE">Available</option>
                      <option value="IN_USE">In Use</option>
                      <option value="IN_SHOP">In Shop</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update Vehicle' : 'Register Vehicle'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Fleet Inventory ({vehicles.length} vehicles)</h3>
        </div>
        {loading ? (
          <div className="py-8"><LoadingSpinner text="Fetching fleet inventory..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Name / Model</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">License Plate</th>
                  <th className="table-th">Capacity (kg)</th>
                  <th className="table-th">Odometer (km)</th>
                  <th className="table-th">Status</th>
                  {isManager && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 && <tr><td colSpan={7} className="table-td text-center py-10 text-slate-400">No vehicles found. Add your first vehicle!</td></tr>}
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td">
                      <div className="font-medium text-slate-800">{v.vehicleName}</div>
                      <div className="text-xs text-slate-400">{v.model}</div>
                    </td>
                    <td className="table-td text-slate-600">{v.type}</td>
                    <td className="table-td font-mono text-xs bg-slate-50 rounded">{v.licensePlate}</td>
                    <td className="table-td font-semibold text-slate-700">{v.maxLoadCapacity.toLocaleString()}</td>
                    <td className="table-td">{v.odometer.toLocaleString()} km</td>
                    <td className="table-td"><StatusBadge status={v.status} /></td>
                    {isManager && (
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(v)} className="text-slate-500 hover:text-brand-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    )}
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
