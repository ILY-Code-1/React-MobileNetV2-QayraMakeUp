import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/users/DashboardPage';
import AnalysisPage from './pages/admin/AnalysisPage';
import AnalysisDetailPage from './pages/admin/AnalysisDetailPage';
import UsersPage from './pages/admin/UsersPage';
import AddUserPage from './pages/admin/AddUserPage';
import CameraPage from './pages/users/CameraPage';
import RiwayatPage from './pages/users/RiwayatPage';
import MobileContainer from './layouts/MobileContainer';
import AppLayout from './layouts/AppLayout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

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
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Camera and History routes */}
        <Route path="camera" element={<CameraPage />} />
        <Route path="riwayat" element={<RiwayatPage />} />

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
              <AnalysisDetailPage />
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

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
