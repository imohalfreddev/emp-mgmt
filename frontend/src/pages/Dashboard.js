import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);

  useEffect(() => {
    api('/api/dashboard/stats').then(setStats).catch(() => {});
    api('/api/messages').then(data => setRecentMessages(data.slice(0, 4))).catch(() => {});
    api('/api/leaves').then(data => setRecentLeaves(data.slice(0, 4))).catch(() => {});
    if (user?.role === 'employee') {
      api('/api/my-admin').then(setAdmin).catch(() => {});
    }
  }, [user]);

  const s = styles(dark);
  const isAdmin = user?.role === 'admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'Total Employees', value: stats?.total_employees ?? '—', icon: '👥', color: '#6c63ff', bg: '#6c63ff18' },
    { label: 'Pending Leaves', value: stats?.pending_leaves ?? '—', icon: '📅', color: '#f5a623', bg: '#f5a62318' },
    { label: 'Unread Alerts', value: stats?.unread_notifications ?? '—', icon: '🔔', color: '#ff6b6b', bg: '#ff6b6b18' },
    { label: 'Total Messages', value: stats?.total_messages ?? '—', icon: '✉️', color: '#48a9fe', bg: '#48a9fe18' },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.greetingBadge}>
            {isAdmin ? '👑 Admin' : '👤 Employee'}
          </div>
          <h1 style={s.title}>{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={s.sub}>
            {isAdmin
              ? `Managing ${user?.company_name} — here's your overview`
              : `Welcome to ${user?.company_name}`}
          </p>
        </div>
        <div style={s.dateBox}>
          <div style={s.dateDay}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
          <div style={s.dateNum}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={s.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} style={s.statCard}>
            <div style={{ ...s.statIconBox, background: card.bg }}>
              <span style={{ fontSize: 24 }}>{card.icon}</span>
            </div>
            <div style={{ ...s.statValue, color: card.color }}>{card.value}</div>
            <div style={s.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Employee: show admin card */}
      {!isAdmin && admin && (
        <div style={s.adminCard}>
          <div style={s.adminCardTitle}>Your Manager</div>
          <div style={s.adminRow}>
            <div style={s.adminAvatar}>{admin.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div style={s.adminName}>{admin.name}</div>
              <div style={s.adminEmail}>{admin.email}</div>
              <div style={s.adminRoleBadge}>Company Admin</div>
            </div>
          </div>
        </div>
      )}

      {/* Two column content */}
      <div style={s.twoCol}>
        {/* Recent Messages */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>✉️ Recent Messages</span>
            <span style={s.sectionCount}>{recentMessages.length}</span>
          </div>
          {recentMessages.length === 0 ? (
            <div style={s.empty}>No messages yet</div>
          ) : (
            recentMessages.map(msg => (
              <div key={msg.id} style={s.msgRow}>
                <div style={s.msgAvatar}>{msg.sender_name?.charAt(0)?.toUpperCase()}</div>
                <div style={s.msgBody}>
                  <div style={s.msgMeta}>
                    <span style={s.msgSender}>{msg.sender_name}</span>
                    <span style={s.msgArrow}>→</span>
                    <span style={s.msgTo}>{msg.receiver_name || 'All'}</span>
                  </div>
                  <div style={s.msgContent}>{msg.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Leave Requests */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>📅 Leave Requests</span>
            <span style={s.sectionCount}>{recentLeaves.length}</span>
          </div>
          {recentLeaves.length === 0 ? (
            <div style={s.empty}>No leave requests</div>
          ) : (
            recentLeaves.map(leave => (
              <div key={leave.id} style={s.leaveRow}>
                <div style={s.leaveInfo}>
                  <div style={s.leaveName}>{leave.user_name}</div>
                  <div style={s.leaveDates}>{leave.start_date} — {leave.end_date}</div>
                </div>
                <span style={{ ...s.statusBadge, ...statusColor(leave.status) }}>
                  {leave.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const statusColor = (status) => {
  if (status === 'approved') return { background: '#00c85322', color: '#00c853' };
  if (status === 'rejected') return { background: '#ff4d4d22', color: '#ff4d4d' };
  return { background: '#f5a62322', color: '#f5a623' };
};

const styles = (dark) => ({
  page: {
    padding: '28px 32px',
    maxWidth: 1100,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 16,
    padding: '24px 28px',
  },
  headerLeft: {},
  greetingBadge: {
    display: 'inline-block',
    background: dark ? '#6c63ff22' : '#6c63ff15',
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    margin: '0 0 6px',
    fontSize: 28,
    fontWeight: 800,
    color: dark ? '#f0f0f5' : '#1a1a2e',
    letterSpacing: '-0.5px',
  },
  sub: { margin: 0, color: dark ? '#888' : '#777', fontSize: 14 },
  dateBox: { textAlign: 'right' },
  dateDay: { fontSize: 13, color: dark ? '#888' : '#999', fontWeight: 500 },
  dateNum: { fontSize: 15, fontWeight: 700, color: dark ? '#e0e0f0' : '#2a2a3e', marginTop: 2 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 14,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  statIconBox: {
    width: 48, height: 48,
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 12, color: dark ? '#888' : '#999', fontWeight: 500 },
  adminCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 24,
    maxWidth: 380,
  },
  adminCardTitle: {
    fontSize: 11, fontWeight: 700,
    color: dark ? '#888' : '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 14,
  },
  adminRow: { display: 'flex', alignItems: 'center', gap: 14 },
  adminAvatar: {
    width: 50, height: 50, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 20, flexShrink: 0,
  },
  adminName: { fontSize: 16, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e' },
  adminEmail: { fontSize: 13, color: dark ? '#888' : '#777', marginTop: 2 },
  adminRoleBadge: {
    display: 'inline-block',
    marginTop: 6,
    background: '#6c63ff22', color: '#6c63ff',
    fontSize: 10, fontWeight: 700,
    padding: '2px 8px', borderRadius: 6,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 },
  section: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 14, padding: '20px',
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: dark ? '#e0e0f0' : '#1a1a2e' },
  sectionCount: {
    background: dark ? '#2a2a35' : '#f0f2f8',
    color: dark ? '#888' : '#666',
    fontSize: 11, fontWeight: 700,
    padding: '2px 8px', borderRadius: 10,
  },
  empty: { color: dark ? '#555' : '#ccc', fontSize: 13, textAlign: 'center', padding: '24px 0' },
  msgRow: { display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  msgAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  msgBody: { flex: 1 },
  msgMeta: { display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 },
  msgSender: { fontSize: 13, fontWeight: 700, color: dark ? '#e0e0f0' : '#2a2a3e' },
  msgArrow: { fontSize: 11, color: dark ? '#555' : '#ccc' },
  msgTo: { fontSize: 12, color: dark ? '#666' : '#aaa' },
  msgContent: { fontSize: 12, color: dark ? '#888' : '#666', lineHeight: 1.5 },
  leaveRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px solid ${dark ? '#222230' : '#f5f5f5'}`,
  },
  leaveInfo: {},
  leaveName: { fontSize: 13, fontWeight: 600, color: dark ? '#e0e0f0' : '#2a2a3e' },
  leaveDates: { fontSize: 12, color: dark ? '#666' : '#aaa', marginTop: 2 },
  statusBadge: {
    fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    borderRadius: 6, padding: '3px 8px',
  },
});

  const s = styles(dark);
  const isAdmin = user?.role === 'admin';

  const statCards = [
    { label: 'Total Employees', value: stats?.total_employees ?? '—', icon: '👥', color: '#6c63ff' },
    { label: 'Pending Leaves', value: stats?.pending_leaves ?? '—', icon: '📅', color: '#f5a623' },
    { label: 'Unread Alerts', value: stats?.unread_notifications ?? '—', icon: '🔔', color: '#ff6b6b' },
    { label: 'Total Messages', value: stats?.total_messages ?? '—', icon: '✉️', color: '#48a9fe' },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={s.sub}>
            {isAdmin ? 'Here\'s what\'s happening in your company.' : `You\'re viewing ${user?.company_name}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} style={s.statCard}>
            <div style={{ ...s.statIcon, background: card.color + '22' }}>
              <span style={{ fontSize: 22 }}>{card.icon}</span>
            </div>
            <div>
              <div style={{ ...s.statValue, color: card.color }}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee view: show admin */}
      {!isAdmin && admin && (
        <div style={s.adminCard}>
          <div style={s.adminCardHeader}>Your Manager</div>
          <div style={s.adminRow}>
            <div style={s.adminAvatar}>{admin.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div style={s.adminName}>{admin.name}</div>
              <div style={s.adminEmail}>{admin.email}</div>
              <div style={s.adminRole}>Company Admin</div>
            </div>
          </div>
        </div>
      )}

      <div style={s.twoCol}>
        {/* Recent Messages */}
        <div style={s.section}>
          <div style={s.sectionHeader}>Recent Messages</div>
          {recentMessages.length === 0 ? (
            <div style={s.empty}>No messages yet</div>
          ) : (
            recentMessages.map(msg => (
              <div key={msg.id} style={s.msgRow}>
                <div style={s.msgAvatar}>{msg.sender_name?.charAt(0)?.toUpperCase()}</div>
                <div style={s.msgBody}>
                  <div style={s.msgMeta}>
                    <span style={s.msgSender}>{msg.sender_name}</span>
                    <span style={s.msgTo}>→ {msg.receiver_name || 'All'}</span>
                  </div>
                  <div style={s.msgContent}>{msg.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Leave Requests */}
        <div style={s.section}>
          <div style={s.sectionHeader}>Leave Requests</div>
          {recentLeaves.length === 0 ? (
            <div style={s.empty}>No leave requests</div>
          ) : (
            recentLeaves.map(leave => (
              <div key={leave.id} style={s.leaveRow}>
                <div style={s.leaveInfo}>
                  <div style={s.leaveName}>{leave.user_name}</div>
                  <div style={s.leaveDates}>{leave.start_date} — {leave.end_date}</div>
                </div>
                <span style={{ ...s.statusBadge, ...statusColor(leave.status) }}>
                  {leave.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const statusColor = (status) => {
  if (status === 'approved') return { background: '#00c85322', color: '#00c853' };
  if (status === 'rejected') return { background: '#ff4d4d22', color: '#ff4d4d' };
  return { background: '#f5a62322', color: '#f5a623' };
};

const styles = (dark) => ({
  page: {
    padding: '32px',
    maxWidth: 1100,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  header: { marginBottom: 28 },
  title: {
    margin: 0, fontSize: 26, fontWeight: 700,
    color: dark ? '#f0f0f5' : '#1a1a2e',
    letterSpacing: '-0.5px',
  },
  sub: { margin: '4px 0 0', color: dark ? '#888' : '#777', fontSize: 14 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12,
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: dark ? '#888' : '#888', marginTop: 4, fontWeight: 500 },
  adminCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12,
    padding: '20px',
    marginBottom: 28,
    maxWidth: 360,
  },
  adminCardHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: dark ? '#888' : '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 14,
  },
  adminRow: { display: 'flex', alignItems: 'center', gap: 14 },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },
  adminName: { fontSize: 16, fontWeight: 600, color: dark ? '#f0f0f5' : '#1a1a2e' },
  adminEmail: { fontSize: 13, color: dark ? '#888' : '#777', marginTop: 2 },
  adminRole: { fontSize: 11, color: '#6c63ff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  section: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12,
    padding: '20px',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 700,
    color: dark ? '#e0e0f0' : '#1a1a2e',
    marginBottom: 16,
  },
  empty: { color: dark ? '#666' : '#bbb', fontSize: 14, textAlign: 'center', padding: '20px 0' },
  msgRow: { display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  msgAvatar: {
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 12, flexShrink: 0,
  },
  msgBody: { flex: 1 },
  msgMeta: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 },
  msgSender: { fontSize: 13, fontWeight: 600, color: dark ? '#e0e0f0' : '#2a2a3e' },
  msgTo: { fontSize: 11, color: dark ? '#666' : '#aaa' },
  msgContent: { fontSize: 12, color: dark ? '#888' : '#666', lineHeight: 1.4 },
  leaveRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: '10px 0',
    borderBottom: `1px solid ${dark ? '#222230' : '#f5f5f5'}`,
  },
  leaveInfo: {},
  leaveName: { fontSize: 13, fontWeight: 600, color: dark ? '#e0e0f0' : '#2a2a3e' },
  leaveDates: { fontSize: 12, color: dark ? '#888' : '#999', marginTop: 2 },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: 6,
    padding: '3px 8px',
  },
});
