import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h7v7H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 18h7v3H3z" />
    </svg>
  ),
  vehicles: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" />
    </svg>
  ),
  trips: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
    </svg>
  ),
  drivers: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  maintenance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  fuel: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h14M3 12h14M3 18h10M17 3v18M14 6l3-3 3 3" />
    </svg>
  ),
  expenses: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  dispatchers: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
    </svg>
  ),
};

const roleMenus = {
  FLEET_MANAGER: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Vehicle Registry', path: '/vehicles', icon: 'vehicles' },
    { label: 'Trip Dispatcher', path: '/trips', icon: 'trips' },
    { label: 'Manage Dispatchers', path: '/dispatchers', icon: 'dispatchers' },
    { label: 'Driver Management', path: '/drivers', icon: 'drivers' },
    { label: 'Maintenance', path: '/maintenance', icon: 'maintenance' },
    { label: 'Fuel Logs', path: '/fuel-logs', icon: 'fuel' },
    { label: 'Trip & Expense', path: '/expenses', icon: 'expenses' },
    { label: 'Analytics', path: '/analytics', icon: 'analytics' },
    { label: 'My Profile', path: '/profile', icon: 'profile' },
  ],
  DISPATCHER: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Trip Dispatcher', path: '/trips', icon: 'trips' },
    { label: 'Vehicle Registry', path: '/vehicles', icon: 'vehicles' },
    { label: 'Driver Management', path: '/drivers', icon: 'drivers' },
    { label: 'Fuel Logs', path: '/fuel-logs', icon: 'fuel' },
    { label: 'My Profile', path: '/profile', icon: 'profile' },
  ],
  DRIVER: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'My Trips', path: '/trips', icon: 'trips' },
    { label: 'Performance', path: '/profile', icon: 'profile' },
  ],
  SAFETY_OFFICER: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Driver Management', path: '/drivers', icon: 'drivers' },
    { label: 'Maintenance', path: '/maintenance', icon: 'maintenance' },
    { label: 'Vehicle Registry', path: '/vehicles', icon: 'vehicles' },
    { label: 'My Profile', path: '/profile', icon: 'profile' },
  ],
  FINANCIAL_ANALYST: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Fuel Logs', path: '/fuel-logs', icon: 'fuel' },
    { label: 'Trip & Expense', path: '/expenses', icon: 'expenses' },
    { label: 'Analytics', path: '/analytics', icon: 'analytics' },
    { label: 'My Profile', path: '/profile', icon: 'profile' },
  ],
};

const roleLabels = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = roleMenus[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col min-h-screen fixed top-0 left-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 17h8M4 17H3a1 1 0 01-1-1V9l2-5h14l2 5v7a1 1 0 01-1 1h-1M9 17a2 2 0 104 0" />
          </svg>
        </div>
        <span className="text-lg font-bold text-slate-800 tracking-tight">FleetFlow</span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{roleLabels[user?.role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {icons[item.icon]}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
