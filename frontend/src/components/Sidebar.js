import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { id: 'dashboard', icon: '▦', label: 'Dashboard' },
  { id: 'employees', icon: '👥', label: 'Employees', adminOnly: true },
  { id: 'messages', icon: '✉️', label: 'Messages' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'leaves', icon: '📅', label: 'Leave Requests' },
];

export default function Sidebar({ active, onNavigate, unreadCount }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const s = styles(dark);

  const filtered = navItems.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <span style={s.logoText}>WorkFlow</span>
      </div>

      <div style={s.companyBadge}>
        <span style={s.companyIcon}>🏢</span>
        <div>
          <div style={s.companyName}>{user?.company_name}</div>
          <div style={s.roleTag}>{user?.role}</div>
        </div>
      </div>

      <nav style={s.nav}>
        {filtered.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...s.navItem,
              ...(active === item.id ? s.navItemActive : {}),
            }}
          >
            <span style={s.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <span style={s.badge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={s.bottom}>
        <button onClick={toggle} style={s.themeBtn}>
          {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <div style={s.userRow}>
          <div style={s.avatar}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userEmail}>{user?.email}</div>
          </div>
        </div>

        <button onClick={logout} style={s.logoutBtn}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = (dark) => ({
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: dark ? '#13131a' : '#ffffff',
    borderRight: `1px solid ${dark ? '#222230' : '#e8eaf2'}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 20px 20px',
    borderBottom: `1px solid ${dark ? '#222230' : '#f0f2f8'}`,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: dark ? '#f0f0f5' : '#1a1a2e',
    letterSpacing: '-0.5px',
  },
  companyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px',
    margin: '12px 12px',
    background: dark ? '#1e1e2a' : '#f5f6fd',
    borderRadius: 10,
  },
  companyIcon: { fontSize: 18 },
  companyName: {
    fontSize: 13,
    fontWeight: 600,
    color: dark ? '#e0e0f0' : '#2a2a3e',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 140,
  },
  roleTag: {
    fontSize: 11,
    color: '#6c63ff',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: 2,
  },
  nav: {
    flex: 1,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: dark ? '#888' : '#666',
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: 'relative',
  },
  navItemActive: {
    background: dark ? '#6c63ff20' : '#6c63ff15',
    color: '#6c63ff',
    fontWeight: 600,
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  badge: {
    marginLeft: 'auto',
    background: '#ff4d4d',
    color: '#fff',
    borderRadius: 10,
    padding: '1px 6px',
    fontSize: 11,
    fontWeight: 700,
  },
  bottom: {
    padding: '12px',
    borderTop: `1px solid ${dark ? '#222230' : '#f0f2f8'}`,
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  themeBtn: {
    width: '100%',
    padding: '8px',
    background: 'none',
    border: `1px solid ${dark ? '#333' : '#e0e3ef'}`,
    borderRadius: 8,
    color: dark ? '#888' : '#666',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 4px',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: dark ? '#e0e0f0' : '#2a2a3e',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: 11,
    color: dark ? '#666' : '#999',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: '#ff4d4d18',
    border: '1px solid #ff4d4d33',
    borderRadius: 8,
    color: '#ff6b6b',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
});
