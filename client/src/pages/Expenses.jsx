import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Fuel', 'Maintenance', 'Toll', 'Parking', 'Driver Allowance', 'Insurance', 'Other'];
const emptyForm = { tripId: '', category: 'Fuel', amount: '', description: '', date: new Date().toISOString().split('T')[0] };

export default function Expenses() {
  const { user } = useAuth();
  const isManager = user?.role === 'FLEET_MANAGER';
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [er, tr] = await Promise.all([api.get('/expenses'), api.get('/trips')]);
      setExpenses(er.data);
      setTrips(tr.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editing) {
        if (editing.isFuelLog) {
          setError('Fuel logs must be edited on the Fuel Logs page.');
          setSaving(false); return;
        }
        await api.put(`/expenses/${editing.id}`, form);
      } else {
        await api.post('/expenses', form);
      }
      setShowForm(false); setForm(emptyForm); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const openEdit = (exp) => {
    if (exp.isFuelLog) {
      alert('This is a Fuel Log entry. Please use the Fuel Logs page to edit detailed fuel data like liters and odometer.');
      return;
    }
    setEditing(exp);
    setForm({
      tripId: exp.tripId || '',
      category: exp.category,
      amount: exp.amount,
      description: exp.description || '',
      date: new Date(exp.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      if (typeof id === 'string' && id.startsWith('fuel-')) {
        await api.delete(`/fuel/${id.split('-')[1]}`);
      } else {
        await api.delete(`/expenses/${id}`);
      }
      load();
    } catch { }
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map(c => ({ name: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0);

  const exportCSV = () => {
    const rows = [['ID', 'Category', 'Amount', 'Description', 'Trip', 'Date']];
    expenses.forEach(e => rows.push([e.id, e.category, e.amount, e.description || '', e.trip ? `${e.trip.origin} → ${e.trip.destination}` : '', new Date(e.date).toLocaleDateString()]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Trip & Expense Logging</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track all operational expenditures</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          {isManager && (
            <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); }} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center py-4 col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-red-500">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-500 mt-1">Total Expenses</p>
        </div>
        {byCategory.slice(0, 3).map(c => (
          <div key={c.name} className="card text-center py-4">
            <p className="text-xl font-bold text-slate-700">₹{c.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-slate-500 mt-1">{c.name}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editing ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>}
              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" className="form-input" placeholder="2500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Trip (Optional)</label>
                <select className="form-input" value={form.tripId} onChange={e => setForm({ ...form, tripId: e.target.value })}>
                  <option value="">-- No Trip --</option>
                  {trips.map(t => <option key={t.id} value={t.id}>#{t.id} — {t.origin} → {t.destination}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g. Monthly vehicle insurance premium" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update Expense' : 'Add Expense'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Expense Records ({expenses.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Category</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Trip</th>
                  <th className="table-th">Date</th>
                  {isManager && <th className="table-th text-right pr-6">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && <tr><td colSpan={6} className="table-td text-center py-10 text-slate-400">No expenses logged yet</td></tr>}
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">{exp.category}</span>
                    </td>
                    <td className="table-td font-semibold text-slate-800">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="table-td text-slate-500 text-sm">{exp.description || '—'}</td>
                    <td className="table-td text-sm">{exp.trip ? `${exp.trip.origin} → ${exp.trip.destination}` : '—'}</td>
                    <td className="table-td text-sm">{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                    {isManager && (
                      <td className="table-td">
                        <div className="flex justify-end gap-2 pr-2">
                          <button onClick={() => openEdit(exp)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
