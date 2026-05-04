import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Signup({ onSwitch }) {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();

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

  return (
    <>
      <style>{responsiveCSS}</style>
      <div className={`signup-page ${dark ? 'dark' : ''}`}>
        <button onClick={toggle} className="theme-toggle">
          {dark ? '☀️' : '🌙'}
        </button>
        <div className="signup-card">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">WorkFlow</span>
          </div>
          <h2 className="title">Create your workspace</h2>
          <p className="subtitle">Start managing your team today</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Company Name</label>
              <input
                className="input"
                placeholder="Acme Corp"
                value={form.company_name}
                onChange={e => setForm({ ...form, company_name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label">Your Name</label>
              <input
                className="input"
                placeholder="John Smith"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating workspace...' : 'Create Workspace'}
            </button>
          </form>

          <p className="switch-text">
            Already have an account?{' '}
            <span className="link" onClick={onSwitch}>Sign in</span>
          </p>
        </div>
      </div>
    </>
  );
}

const responsiveCSS = `
  /* ========== Base & Variable-like defaults ========== */
  .signup-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f4f6fb;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    position: relative;
    padding: 20px;
    box-sizing: border-box;
    transition: background 0.3s;
  }
  .signup-page.dark {
    background: #0f0f13;
  }

  .theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 18px;
    z-index: 10;
  }
  .dark .theme-toggle {
    border-color: #333;
  }

  .signup-card {
    background: #fff;
    border: 1px solid #e5e7ef;
    border-radius: 16px;
    padding: 40px 36px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.08);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    margin: auto 0; /* helps vertical centering when page flex handles it */
  }
  .dark .signup-card {
    background: #18181f;
    border-color: #2a2a35;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }

  .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .logo-icon { font-size: 24px; color: #f1c40f; }
  .logo-text { font-size: 20px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.5px; }
  .dark .logo-text { color: #fff; }

  .title {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.5px;
  }
  .dark .title { color: #f0f0f5; }

  .subtitle {
    margin: 0 0 28px;
    color: #777;
    font-size: 14px;
  }
  .dark .subtitle { color: #888; }

  .error {
    background: #ff4d4d22;
    border: 1px solid #ff4d4d55;
    color: #ff6b6b;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .field { margin-bottom: 16px; }
  .label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #555;
  }
  .dark .label { color: #aaa; }

  .input {
    width: 100%;
    padding: 12px 14px;
    background: #f8f9fc;
    border: 1px solid #dde1ec;
    border-radius: 12px;
    color: #1a1a2e;
    font-size: 16px;
    outline: none;
    box-sizing: border-box;
    transition: background 0.3s, border-color 0.3s, color 0.3s;
  }
  .dark .input {
    background: #222230;
    border-color: #333;
    color: #f0f0f5;
  }
  .input:focus { border-color: #6c63ff; }

  .submit-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #6c63ff, #48a9fe);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s;
  }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .switch-text {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #777;
  }
  .dark .switch-text { color: #888; }
  .link { color: #6c63ff; cursor: pointer; font-weight: 600; }

  /* ========== Responsive adjustments (pure CSS) ========== */
  @media (max-width: 480px) {
    .signup-page {
      padding: 0;            /* no extra page padding on phone */
    }
    .signup-card {
      max-width: 100%;
      /* removed min-height: 100vh → card only as tall as its content */
      border-radius: 0;
      border: none;
      box-shadow: none;
      padding: 40px 24px;    /* reduced top/bottom padding (was 60px) */
      justify-content: center;
    }
    .logo-icon { font-size: 32px; }
    .logo-text { font-size: 24px; }
    .title { font-size: 28px; }
    .subtitle { font-size: 16px; }
    .input { padding: 16px; }
    .submit-btn { padding: 18px; }
    .switch-text { margin-top: 30px; }  /* slightly tighter */
  }

  @media (min-width: 481px) and (max-width: 768px) {
    .signup-card {
      max-width: 90%;
      padding: 36px 32px;
    }
    .input { padding: 14px 16px; }
  }
`;