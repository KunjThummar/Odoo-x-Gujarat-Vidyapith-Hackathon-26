import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dispatchers() {
    const [dispatchers, setDispatchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchDispatchers = async (query = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/dispatchers?search=${query}`);
            setDispatchers(res.data);
        } catch (err) {
            setError('Failed to load dispatchers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchDispatchers(search);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!/^\d{10}$/.test(form.phone)) {
            setError('Phone number must be 10 digits');
            return;
        }

        try {
            if (editing) {
                await api.put(`/dispatchers/${editing.id}`, form);
                setSuccess('Dispatcher updated successfully');
            } else {
                await api.post('/dispatchers', form);
                setSuccess('Dispatcher created successfully');
            }
            setShowModal(false);
            setForm({ name: '', email: '', phone: '' });
            setEditing(null);
            fetchDispatchers(search);
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this dispatcher?')) return;
        try {
            await api.delete(`/dispatchers/${id}`);
            setSuccess('Dispatcher deleted');
            fetchDispatchers(search);
        } catch (err) {
            setError('Delete failed');
        }
    };

    const openEdit = (d) => {
        setEditing(d);
        setForm({ name: d.name, email: d.email, phone: d.phone });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        className="form-input pl-10"
                        placeholder="Search dispatchers by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '' }); setShowModal(true); }} className="btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Dispatcher
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}
            {success && <div className="p-4 bg-green-50 text-green-600 rounded-xl border border-green-100">{success}</div>}

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8"><LoadingSpinner text="Fetching dispatchers..." /></td></tr>
                        ) : dispatchers.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No dispatchers found</td></tr>
                        ) : (
                            dispatchers.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700">{d.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{d.email}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{d.phone}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEdit(d)} className="text-brand-600 hover:text-brand-700 mr-4 font-medium text-sm">Edit</button>
                                        <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-700 font-medium text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Dispatcher' : 'Add New Dispatcher'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Phone Number</label>
                                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} maxLength="10" required />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Save Changes' : 'Add Dispatcher'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
