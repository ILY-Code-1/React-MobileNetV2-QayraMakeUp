import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import UsersPage from './pages/UsersPage';
import AddUserPage from './pages/AddUserPage';
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

      {/* Protected Routes with MobileContainer and AppLayout for main pages */}
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
        {/* Routes yang pakai header dan footer standar */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Routes dengan header sendiri (tanpa AppLayout) */}
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
