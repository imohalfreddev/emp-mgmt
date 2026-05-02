import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', company_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/api/companies').then(setCompanies).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ ...form, company_id: parseInt(form.company_id) }),
      });
      login(data.user, data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(dark);

  return (
    <div style={s.page}>
      <button onClick={toggle} style={s.themeBtn}>{dark ? '☀️' : '🌙'}</button>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <span style={s.logoText}>WorkFlow</span>
        </div>
        <h2 style={s.title}>Welcome back</h2>
        <p style={s.sub}>Sign in to your workspace</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Company</label>
            <select
              style={s.input}
              value={form.company_id}
              onChange={e => setForm({ ...form, company_id: e.target.value })}
              required
            >
              <option value="">Select your company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
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
            />
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.switchText}>
          Don't have an account?{' '}
          <span style={s.link} onClick={onSwitch}>Create workspace</span>
        </p>
      </div>
    </div>
  );
}

const styles = (dark) => ({
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: dark ? '#0f0f13' : '#f4f6fb',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: 'relative',
  },
  themeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'none',
    border: `1px solid ${dark ? '#333' : '#ddd'}`,
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 18,
  },
  card: {
    background: dark ? '#18181f' : '#ffffff',
    border: `1px solid ${dark ? '#2a2a35' : '#e5e7ef'}`,
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 8px 40px rgba(0,0,0,0.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: dark ? '#fff' : '#1a1a2e',
    letterSpacing: '-0.5px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: 24,
    fontWeight: 700,
    color: dark ? '#f0f0f5' : '#1a1a2e',
    letterSpacing: '-0.5px',
  },
  sub: {
    margin: '0 0 28px',
    color: dark ? '#888' : '#777',
    fontSize: 14,
  },
  error: {
    background: '#ff4d4d22',
    border: '1px solid #ff4d4d55',
    color: '#ff6b6b',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 16,
    fontSize: 13,
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 500,
    color: dark ? '#aaa' : '#555',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8,
    color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    appearance: 'none',
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: '0.2px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: dark ? '#888' : '#777',
  },
  link: {
    color: '#6c63ff',
    cursor: 'pointer',
    fontWeight: 600,
  },
});
