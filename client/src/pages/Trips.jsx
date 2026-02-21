import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { tripType: 'Delivery', origin: '', destination: '', cargoWeight: '', estimatedFuel: '', vehicleId: '', driverId: '' };

export default function Trips() {
  const { user } = useAuth();
  const canCreate = ['FLEET_MANAGER', 'DISPATCHER'].includes(user?.role);
  const isDriver = user?.role === 'DRIVER';

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const load = async (query = '') => {
    setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get(`/trips?search=${query}`),
        api.get('/vehicles'),
        canCreate ? api.get('/drivers') : Promise.resolve({ data: [] }),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      load(search);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editing) await api.put(`/trips/${editing.id}`, form);
      else await api.post('/trips', form);
      setShowForm(false); setEditing(null); load(search);
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (trip, status) => {
    try { await api.put(`/trips/${trip.id}`, { status }); load(search); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const acceptTrip = async (trip) => {
    try { await api.put(`/trips/${trip.id}`, { status: 'DISPATCHED', driverId: user.id }); load(search); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ tripType: t.tripType, origin: t.origin, destination: t.destination, cargoWeight: t.cargoWeight, estimatedFuel: t.estimatedFuel || '', vehicleId: t.vehicleId || '', driverId: t.driverId || '' });
    setShowForm(true);
  };

  const statuses = ['ALL', 'DRAFT', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? trips : trips.filter(t => t.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Trip {isDriver ? 'Management' : 'Dispatcher'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{isDriver ? 'View and manage your trips' : 'Create and dispatch fleet trips'}</p>
        </div>
        <div className="flex flex-1 items-center gap-3 justify-end">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canCreate && (
            <button onClick={() => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); }} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Trip
            </button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s === 'ALL' ? 'All Trips' : s.replace('_', ' ')}
            {s !== 'ALL' && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{trips.filter(t => t.status === s).length}</span>}
          </button>
        ))}
      </div>

      {/* Driver-only info banner */}
      {isDriver && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>Available Trips</strong> — Trips with <em>Open</em> driver status are unassigned. You can accept them to take ownership.
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-slate-800">{editing ? 'Edit Trip' : 'New Trip'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}

              <div>
                <label className="form-label">Trip Type</label>
                <select className="form-input" value={form.tripType} onChange={e => setForm({ ...form, tripType: e.target.value })}>
                  {['Delivery', 'Pickup', 'Transfer', 'Return'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Select Vehicle</label>
                <select className="form-input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.filter(v => v.status === 'AVAILABLE').map(v => (
                    <option key={v.id} value={v.id}>{v.vehicleName} — {v.licensePlate} (Max: {v.maxLoadCapacity}kg)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Cargo Weight (kg)</label>
                <input type="number" className="form-input" placeholder="500"
                  value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} required />
                {form.vehicleId && form.cargoWeight && (
                  (() => {
                    const v = vehicles.find(v => v.id == form.vehicleId);
                    const over = v && parseFloat(form.cargoWeight) > v.maxLoadCapacity;
                    return over ? <p className="text-xs text-red-500 mt-1">⚠️ Exceeds vehicle capacity ({v.maxLoadCapacity}kg)!</p> : null;
                  })()
                )}
              </div>

              <div>
                <label className="form-label">Select Driver</label>
                <select className="form-input" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                  <option value="">-- Unassigned --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Origin Address</label>
                <input className="form-input" placeholder="Ahmedabad" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Destination</label>
                <input className="form-input" placeholder="Surat" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Estimated Fuel (Liters)</label>
                <input type="number" className="form-input" placeholder="45"
                  value={form.estimatedFuel} onChange={e => setForm({ ...form, estimatedFuel: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saving...' : editing ? 'Update Trip' : 'Confirm & Dispatch Trip'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Trips ({filtered.length})</h3>
        </div>
        {loading ? (
          <div className="py-8"><LoadingSpinner text="Fetching trip schedule..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Trip ID</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Origin → Dest</th>
                  <th className="table-th">Vehicle</th>
                  <th className="table-th">Driver</th>
                  <th className="table-th text-right">Cargo (kg)</th>
                  <th className="table-th text-right text-red-600">Expenses (₹)</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={9} className="table-td text-center py-10 text-slate-400">No trips found</td></tr>}
                {filtered.map(trip => (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td font-mono text-xs text-slate-500">#{trip.id.toString().padStart(4, '0')}</td>
                    <td className="table-td">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-600">{trip.tripType}</span>
                    </td>
                    <td className="table-td">
                      <div className="text-sm">{trip.origin} → {trip.destination}</div>
                    </td>
                    <td className="table-td">{trip.vehicle?.vehicleName || <span className="text-slate-400 text-xs">Unassigned</span>}</td>
                    <td className="table-td">{trip.driver?.fullName || <span className="text-amber-500 text-xs font-medium">Open</span>}</td>
                    <td className="table-td text-right font-semibold">{trip.cargoWeight.toLocaleString()}</td>
                    <td className="table-td text-right font-bold text-red-500">₹{(trip.totalExpense || 0).toLocaleString('en-IN')}</td>
                    <td className="table-td"><StatusBadge status={trip.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Driver actions */}
                        {isDriver && trip.status === 'DRAFT' && !trip.driverId && (
                          <button onClick={() => acceptTrip(trip)} className="btn-primary text-xs py-1 px-2.5">Accept</button>
                        )}
                        {isDriver && trip.driverId === user.id && trip.status === 'DISPATCHED' && (
                          <button onClick={() => updateStatus(trip, 'IN_PROGRESS')} className="btn-primary text-xs py-1 px-2.5">Start Trip</button>
                        )}
                        {isDriver && trip.driverId === user.id && trip.status === 'IN_PROGRESS' && (
                          <button onClick={() => updateStatus(trip, 'COMPLETED')} className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2.5 rounded-lg font-medium">Complete</button>
                        )}
                        {/* Manager/Dispatcher actions */}
                        {canCreate && trip.status === 'DRAFT' && (
                          <>
                            <button onClick={() => openEdit(trip)} className="text-slate-500 hover:text-brand-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => updateStatus(trip, 'DISPATCHED')} className="btn-primary text-xs py-1 px-2.5">Dispatch</button>
                          </>
                        )}
                        {canCreate && ['DRAFT', 'DISPATCHED'].includes(trip.status) && (
                          <button onClick={() => updateStatus(trip, 'CANCELLED')} className="text-xs py-1 px-2.5 text-red-500 hover:bg-red-50 rounded-lg font-medium">Cancel</button>
                        )}
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
