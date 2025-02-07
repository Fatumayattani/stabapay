import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Components
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Send from './pages/Send';
import Profile from './pages/Profile';
import Contacts from './pages/Contacts';
import { usePrivy } from '@privy-io/react-auth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, ready } = usePrivy();
  
  if (!ready) {
    return <div>Loading...</div>;
  }
  
  if (!authenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#007AFF',
        },
      }}
    >
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/send"
                element={
                  <ProtectedRoute>
                    <Send />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </PrivyProvider>
  );
};

export default App;
