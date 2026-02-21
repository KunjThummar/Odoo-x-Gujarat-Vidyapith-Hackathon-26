import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicle Registry',
  '/trips': 'Trip Dispatcher',
  '/drivers': 'Driver Management',
  '/maintenance': 'Maintenance & Service',
  '/fuel-logs': 'Fuel Logs',
  '/dispatchers': 'Manage Dispatchers',
  '/expenses': 'Trip & Expense',
  '/analytics': 'Analytics & Reports',
  '/profile': 'My Profile',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FleetFlow';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Welcome, <span className="font-medium text-slate-700">{user?.fullName}</span></span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
