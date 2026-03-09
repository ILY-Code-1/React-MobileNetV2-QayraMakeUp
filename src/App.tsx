import React, { useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuthStore } from './store/authStore';
import { AppRoutes } from './routes';

const AppInit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInit>
          <AppRoutes />
        </AppInit>
      </AuthProvider>
    </Router>
  );
}

export default App;
