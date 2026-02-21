import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0c93e4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const rows = [['Month', 'Revenue', 'Fuel Cost', 'Maintenance', 'Net Profit']];
    data.monthlySummary.forEach(m => rows.push([m.month, m.revenue, m.fuelCost, m.maintenance, m.netProfit]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'analytics.csv'; a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
    </div>
  );

  const { summary, fuelEfficiency, monthlySummary } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational Analytics & Financial Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive fleet performance and cost analysis</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-200/50">
          <p className="text-blue-100 text-sm font-medium">Total Fuel Cost</p>
          <p className="text-3xl font-bold mt-2">₹{(summary?.totalFuelCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-blue-200 text-xs mt-1">{summary?.totalLiters?.toFixed(1)} liters total</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-200/50">
          <p className="text-red-100 text-sm font-medium">Operational Cost</p>
          <p className="text-3xl font-bold mt-2">₹{(summary?.operationalCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-red-200 text-xs mt-1">Including fuel & maintenance</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-200/50">
          <p className="text-green-100 text-sm font-medium">Net Profit (Est.)</p>
          <p className="text-3xl font-bold mt-2">₹{(summary?.netProfit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-green-200 text-xs mt-1">Total profit for current year</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-200/50">
          <p className="text-purple-100 text-sm font-medium">Utilization Rate</p>
          <p className="text-3xl font-bold mt-2">{summary?.utilizationRate || 0}%</p>
          <p className="text-purple-200 text-xs mt-1">{summary?.activeVehicles} of {summary?.totalVehicles} active</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Fuel Efficiency Trend */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Fuel Efficiency Trend (mL)</h3>
          {monthlySummary && monthlySummary.some(m => m.fuelCost > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="fuelCost" stroke="#0c93e4" strokeWidth={2} dot={{ r: 3 }} name="Fuel Cost" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No fuel data yet</div>
          )}
        </div>

        {/* Top 5 Cost Vehicles */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Top 5 Costliest Vehicles</h3>
          {fuelEfficiency && fuelEfficiency.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fuelEfficiency.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="vehicle" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="cost" fill="#0c93e4" radius={[4, 4, 0, 0]} name="Fuel Cost" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No vehicle data yet</div>
          )}
        </div>
      </div>

      {/* Monthly Financial Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Financial Summary of Month</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th text-left">Month</th>
                <th className="table-th text-right">Revenue (Est.)</th>
                <th className="table-th text-right text-blue-600">Fuel Cost</th>
                <th className="table-th text-right text-amber-600">Maintenance</th>
                <th className="table-th text-right text-red-500">Other Costs</th>
                <th className="table-th text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary?.filter(m => m.revenue > 0 || m.fuelCost > 0 || m.maintenance > 0 || m.otherExpenses > 0).map(m => (
                <tr key={m.month} className="hover:bg-slate-50">
                  <td className="table-td font-medium text-slate-700">{m.month}</td>
                  <td className="table-td text-right text-green-600 font-semibold">₹{m.revenue.toLocaleString('en-IN')}</td>
                  <td className="table-td text-right text-blue-500">₹{m.fuelCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="table-td text-right text-amber-600">₹{m.maintenance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="table-td text-right text-red-400">₹{m.otherExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className={`table-td text-right font-bold ${m.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    ₹{m.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
              {monthlySummary?.every(m => m.revenue === 0 && m.fuelCost === 0 && m.maintenance === 0 && m.otherExpenses === 0) && (
                <tr><td colSpan={6} className="table-td text-center py-10 text-slate-400">No financial data yet. Add trips, fuel logs, components and expenses to see analytics.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vehicles', value: summary?.totalVehicles },
          { label: 'Total Drivers', value: summary?.totalDrivers },
          { label: 'Total Trips', value: summary?.totalTrips },
          { label: 'Completed Trips', value: summary?.completedTrips },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className="text-2xl font-bold text-brand-600">{s.value ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
