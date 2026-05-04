import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

// Custom hook to handle responsiveness
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

export default function Signup({ onSwitch }) {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const width = useWindowWidth();
  
  const [form, setForm] = useState({ company_name: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/api/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data.user, data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine if we are on a mobile screen (typical breakpoint 480px)
  const isMobile = width <= 480;
  const s = useMemo(() => styles(dark, isMobile), [dark, isMobile]);

  return (
    <div style={s.page}>
      <button onClick={toggle} style={s.themeBtn}>{dark ? '☀️' : '🌙'}</button>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <span style={s.logoText}>WorkFlow</span>
        </div>
        <h2 style={s.title}>Create your workspace</h2>
        <p style={s.sub}>Start managing your team today</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Company Name</label>
            <input
              style={s.input}
              placeholder="Acme Corp"
              value={form.company_name}
              onChange={e => setForm({ ...form, company_name: e.target.value })}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Your Name</label>
            <input
              style={s.input}
              placeholder="John Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Creating workspace...' : 'Create Workspace'}
          </button>
        </form>

        <p style={s.switchText}>
          Already have an account?{' '}
          <span style={s.link} onClick={onSwitch}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const styles = (dark, isMobile) => ({
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: dark ? '#0f0f13' : '#f4f6fb',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: 'relative',
    padding: isMobile ? '20px' : '0', // Prevents card from touching screen edges
    boxSizing: 'border-box',
  },
  themeBtn: {
    position: 'absolute',
    top: isMobile ? 10 : 20, 
    right: isMobile ? 10 : 20,
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#333' : '#ddd'}`,
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 18,
    zIndex: 10,
  },
  card: {
    background: dark ? '#18181f' : '#ffffff',
    border: `1px solid ${dark ? '#2a2a35' : '#e5e7ef'}`,
    borderRadius: 16,
    padding: isMobile ? '30px 24px' : '40px 36px',
    width: '100%',
    maxWidth: 400,
    boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 8px 40px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
  logoIcon: { fontSize: 24 },
  logoText: { fontSize: 20, fontWeight: 700, color: dark ? '#fff' : '#1a1a2e', letterSpacing: '-0.5px' },
  title: { margin: '0 0 4px', fontSize: isMobile ? 20 : 24, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e', letterSpacing: '-0.5px' },
  sub: { margin: '0 0 28px', color: dark ? '#888' : '#777', fontSize: 14 },
  error: { background: '#ff4d4d22', border: '1px solid #ff4d4d55', color: '#ff6b6b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: dark ? '#aaa' : '#555' },
  input: {
    width: '100%', // Changed from 90% for better alignment
    padding: '12px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 12,
    color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', // Changed from 90%
    padding: '14px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: dark ? '#888' : '#777' },
  link: { color: '#6c63ff', cursor: 'pointer', fontWeight: 600 },
});