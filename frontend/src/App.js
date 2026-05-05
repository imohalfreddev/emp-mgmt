import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Leaves from './pages/Leaves';
import Sidebar from './components/Sidebar';
import api from './utils/api';

function AppContent() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [page, setPage] = useState('landing');
  const [activePage, setActivePage] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api('/api/notifications').then(data => {
        setUnreadCount(data.filter(n => !n.is_read).length);
      }).catch(() => {});
    }
  }, [user, activePage]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: dark ? '#0f0f13' : '#f4f6fb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: dark ? '#888' : '#aaa', fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    if (page === 'login') return <Login onSwitch={() => setPage('signup')} onBack={() => setPage('landing')} />;
    if (page === 'signup') return <Signup onSwitch={() => setPage('login')} onBack={() => setPage('landing')} />;
    return <Landing onLogin={() => setPage('login')} onSignup={() => setPage('signup')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return user.role === 'admin' ? <Employees /> : <Dashboard />;
      case 'messages': return <Messages />;
      case 'notifications': return <Notifications onRead={setUnreadCount} />;
      case 'leaves': return <Leaves />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: dark ? '#0f0f13' : '#f0f2f8',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <Sidebar
        active={activePage}
        onNavigate={setActivePage}
        unreadCount={unreadCount}
      />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}