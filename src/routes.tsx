import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/users/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AnalysisPage from './pages/admin/AnalysisPage';
import AdminAnalysisDetailPage from './pages/admin/AnalysisDetailPage';
import UsersPage from './pages/admin/UsersPage';
import AddUserPage from './pages/admin/AddUserPage';
import EditUserPage from './pages/admin/EditUserPage';
import CameraPage from './pages/users/CameraPage';
import RiwayatPage from './pages/users/RiwayatPage';
import UserAnalysisDetailPage from './pages/users/AnalysisDetailPage';
import MobileContainer from './layouts/MobileContainer';
import AppLayout from './layouts/AppLayout';

// Role-based dashboard: admin sees AdminDashboardPage, user sees DashboardPage
const DashboardRoute: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? <AdminDashboardPage /> : <DashboardPage />;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// App Routes
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes with MobileContainer and AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MobileContainer>
              <AppLayout />
            </MobileContainer>
          </ProtectedRoute>
        }
      >
        {/* Main dashboard route - default */}
        <Route index element={<DashboardRoute />} />
        <Route path="dashboard" element={<DashboardRoute />} />

        {/* Camera and History routes */}
        <Route path="camera" element={<CameraPage />} />
        <Route path="riwayat" element={<RiwayatPage />} />
        <Route path="riwayat/:id" element={<UserAnalysisDetailPage />} />

        {/* Analysis and Users routes */}
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Detail Routes (with own header) */}
      <Route
        path="/analysis/:id"
        element={
          <ProtectedRoute>
            <MobileContainer>
              <AdminAnalysisDetailPage />
            </MobileContainer>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/add"
        element={
          <ProtectedRoute>
            <MobileContainer>
              <AddUserPage />
            </MobileContainer>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute>
            <MobileContainer>
              <EditUserPage />
            </MobileContainer>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
