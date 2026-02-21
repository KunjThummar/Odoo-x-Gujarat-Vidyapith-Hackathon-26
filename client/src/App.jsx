import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import RegisterDriver from './pages/RegisterDriver';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Drivers from './pages/Drivers';
import Dispatchers from './pages/Dispatchers';
import Maintenance from './pages/Maintenance';
import FuelLogs from './pages/FuelLogs';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import MyProfile from './pages/MyProfile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/register-driver" element={<PublicRoute><RegisterDriver /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vehicles" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']}><Vehicles /></ProtectedRoute>} />
        <Route path="trips" element={<Trips />} />
        <Route path="drivers" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']}><Drivers /></ProtectedRoute>} />
        <Route path="dispatchers" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER']}><Dispatchers /></ProtectedRoute>} />
        <Route path="maintenance" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']}><Maintenance /></ProtectedRoute>} />
        <Route path="fuel-logs" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST']}><FuelLogs /></ProtectedRoute>} />
        <Route path="expenses" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}><Expenses /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}><Analytics /></ProtectedRoute>} />
        <Route path="profile" element={<MyProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
