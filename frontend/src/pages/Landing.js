import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Landing({ onLogin, onSignup }) {
  const { dark, toggle } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const s = styles(dark, isMobile);

  const features = [
    { icon: '👥', title: 'Team Management', desc: 'Add and manage employees with role-based access control' },
    { icon: '✉️', title: 'Messaging', desc: 'Send direct messages or broadcast to your entire team' },
    { icon: '📅', title: 'Leave Requests', desc: 'Employees request leave, admins approve or reject instantly' },
    { icon: '🔔', title: 'Notifications', desc: 'Real-time notifications keep your team always informed' },
    { icon: '🏢', title: 'Multi-Tenant', desc: 'Each company has fully isolated and secure data' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Beautiful dark and light themes for comfortable use' },
  ];

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navLogoIcon}>⚡</div>
          <span style={s.navLogoText}>WorkFlow</span>
        </div>
        <div style={s.navRight}>
          <button onClick={toggle} style={s.themeBtn}>{dark ? '☀️' : '🌙'}</button>
          {!isMobile && (
            <button onClick={onLogin} style={s.navLoginBtn}>Sign In</button>
          )}
          <button onClick={onSignup} style={s.navSignupBtn}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroBadge}>🚀 Employee Management Made Simple</div>
        <h1 style={s.heroTitle}>
          Manage Your Team<br />
          <span style={s.heroGradient}>Like a Pro</span>
        </h1>
        <p style={s.heroSub}>
          WorkFlow is a modern SaaS platform for managing employees, messages, leave requests and notifications — all in one place.
        </p>
        <div style={s.heroBtns}>
          <button onClick={onSignup} style={s.heroCta}>
            Create Free Workspace →
          </button>
          <button onClick={onLogin} style={s.heroSecondary}>
            Sign In
          </button>
        </div>
        <div style={s.heroStats}>
          <div style={s.heroStat}><span style={s.heroStatNum}>100%</span> Free to use</div>
          <div style={s.heroStatDot}>•</div>
          <div style={s.heroStat}><span style={s.heroStatNum}>Multi</span> Company support</div>
          <div style={s.heroStatDot}>•</div>
          <div style={s.heroStat}><span style={s.heroStatNum}>JWT</span> Secure auth</div>
        </div>
      </div>

      {/* Features */}
      <div style={s.featuresSection}>
        <h2 style={s.featuresTitle}>Everything your team needs</h2>
        <p style={s.featuresSub}>Built for modern businesses of all sizes</p>
        <div style={s.featuresGrid}>
          {features.map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Ready to get started?</h2>
        <p style={s.ctaSub}>Create your workspace in under 60 seconds</p>
        <button onClick={onSignup} style={s.ctaBtn}>
          Create Free Workspace →
        </button>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>
          <span>⚡</span> <span style={{ fontWeight: 700 }}>WorkFlow</span>
        </div>
        <div style={s.footerText}>Built with React, FastAPI & PostgreSQL</div>
      </footer>
    </div>
  );
}

const styles = (dark, isMobile) => ({
  page: {
    minHeight: '100vh',
    background: dark ? '#0f0f13' : '#f8f9fc',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: dark ? '#f0f0f5' : '#1a1a2e',
  },

  // ── Navbar ──────────────────────────────────────────────
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: isMobile ? '12px 16px' : '16px 40px',   // tighter on mobile
    borderBottom: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    background: dark ? '#13131a' : '#fff',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navLogoIcon: {
    width: 34, height: 34,
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  navLogoText: { fontSize: 18, fontWeight: 800, color: dark ? '#fff' : '#1a1a2e' },
  navRight: { display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 },
  themeBtn: {
    background: 'none', border: `1px solid ${dark ? '#333' : '#ddd'}`,
    borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16,
  },
  navLoginBtn: {
    background: 'none', border: `1px solid ${dark ? '#333' : '#ddd'}`,
    borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
    color: dark ? '#aaa' : '#555', fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  navSignupBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    border: 'none', borderRadius: 8,
    padding: isMobile ? '8px 14px' : '8px 18px',
    cursor: 'pointer', color: '#fff',
    fontSize: isMobile ? 13 : 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    whiteSpace: 'nowrap',                             // prevent text wrapping
  },

  // ── Hero ─────────────────────────────────────────────────
  hero: {
    textAlign: 'center',
    padding: isMobile ? '40px 20px 36px' : '80px 40px 60px',  // less top padding on mobile
    maxWidth: 700,
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    background: dark ? '#6c63ff22' : '#6c63ff15',
    color: '#6c63ff',
    fontSize: isMobile ? 12 : 13, fontWeight: 700,
    padding: '6px 14px', borderRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: isMobile ? 36 : 54,                    // 36px on mobile vs 54px desktop
    fontWeight: 900,
    lineHeight: 1.1, margin: '0 0 16px',
    letterSpacing: isMobile ? '-0.5px' : '-1.5px',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: isMobile ? 15 : 17,
    color: dark ? '#aaa' : '#666',                   // slightly brighter on dark
    lineHeight: 1.7, margin: '0 0 28px',
  },
  heroBtns: {
    display: 'flex',
    flexDirection: 'column',                          // always stack vertically
    gap: 12,
    alignItems: 'stretch',                            // full width buttons
    marginBottom: 28,
    maxWidth: isMobile ? '100%' : 320,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroCta: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(108,99,255,0.4)',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  heroSecondary: {
    padding: '14px 28px',
    background: 'none',
    border: `1.5px solid ${dark ? '#333' : '#ddd'}`,
    color: dark ? '#ccc' : '#555',                   // brighter text on dark
    borderRadius: 12, fontSize: 16, fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  heroStats: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: isMobile ? 8 : 12,
    flexWrap: 'wrap',                                 // wrap on very narrow screens
  },
  heroStat: { fontSize: isMobile ? 12 : 13, color: dark ? '#777' : '#999' },
  heroStatNum: { fontWeight: 700, color: dark ? '#bbb' : '#555' },
  heroStatDot: { color: dark ? '#444' : '#ccc' },

  // ── Features ─────────────────────────────────────────────
  featuresSection: {
    padding: isMobile ? '40px 16px' : '60px 40px',
    maxWidth: 1000,
    margin: '0 auto',
    textAlign: 'center',
  },
  featuresTitle: {
    fontSize: isMobile ? 26 : 36, fontWeight: 800, margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  featuresSub: { fontSize: 15, color: dark ? '#888' : '#777', margin: '0 0 32px' },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',  // 1 col mobile, 3 desktop
    gap: isMobile ? 12 : 20,
    textAlign: 'left',
  },
  featureCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 14, padding: '20px',
  },
  featureIcon: { fontSize: 28, marginBottom: 12 },
  featureTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: dark ? '#f0f0f5' : '#1a1a2e' },
  featureDesc: { fontSize: 13, color: dark ? '#888' : '#777', lineHeight: 1.6 },

  // ── CTA ──────────────────────────────────────────────────
  ctaSection: {
    textAlign: 'center',
    padding: isMobile ? '40px 20px' : '60px 40px',
    background: dark ? '#18181f' : '#fff',
    borderTop: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderBottom: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
  },
  ctaTitle: { fontSize: isMobile ? 24 : 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' },
  ctaSub: { fontSize: 15, color: dark ? '#888' : '#777', margin: '0 0 24px' },
  ctaBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(108,99,255,0.4)',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    width: isMobile ? '100%' : 'auto',               // full width on mobile
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    padding: isMobile ? '20px 16px' : '24px 40px',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',      // stack on mobile
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: isMobile ? 6 : 0,
    color: dark ? '#555' : '#aaa', fontSize: 13,
    textAlign: isMobile ? 'center' : 'left',
  },
  footerLogo: { display: 'flex', gap: 6, alignItems: 'center' },
  footerText: {},
});