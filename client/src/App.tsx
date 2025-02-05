import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

// Components
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Send from './pages/Send';
import Profile from './pages/Profile';
import Contacts from './pages/Contacts';

const App: React.FC = () => {
  return (
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID || ''}
      onSuccess={(user) => {
        console.log('Authenticated successfully:', user);
      }}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#007AFF',
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/send" element={<Send />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </PrivyProvider>
  );
};

export default App;
