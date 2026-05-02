import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Notifications({ onRead }) {
  const { dark } = useTheme();
  const [notifications, setNotifications] = useState([]);

  const load = () => {
    api('/api/notifications').then(data => {
      setNotifications(data);
      onRead && onRead(data.filter(n => !n.is_read).length);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    load();
  };

  const markAllRead = async () => {
    await api('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {});
    load();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const s = styles(dark);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Notifications</h1>
          <p style={s.sub}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button style={s.markAllBtn} onClick={markAllRead}>
            ✓ Mark all read
          </button>
        )}
      </div>

      <div style={s.list}>
        {notifications.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div>No notifications yet</div>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              style={{ ...s.card, ...(notif.is_read ? {} : s.unread) }}
            >
              <div style={s.notifIcon}>
                {notif.is_read ? '🔕' : '🔔'}
              </div>
              <div style={s.notifBody}>
                <div style={s.notifContent}>{notif.content}</div>
                <div style={s.notifTime}>
                  {notif.created_at ? new Date(notif.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : ''}
                </div>
              </div>
              {!notif.is_read && (
                <button style={s.readBtn} onClick={() => markRead(notif.id)}>
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = (dark) => ({
  page: { padding: '32px', maxWidth: 700, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e', letterSpacing: '-0.5px' },
  sub: { margin: '4px 0 0', color: dark ? '#888' : '#777', fontSize: 14 },
  markAllBtn: {
    padding: '8px 16px',
    background: dark ? '#222230' : '#f5f6fd',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8, color: dark ? '#aaa' : '#555',
    fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', padding: '60px 20px', color: dark ? '#666' : '#bbb', fontSize: 14 },
  card: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '16px 20px',
  },
  unread: {
    borderColor: '#6c63ff44',
    background: dark ? '#1c1c2a' : '#f8f7ff',
  },
  notifIcon: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  notifBody: { flex: 1 },
  notifContent: { fontSize: 14, color: dark ? '#e0e0f0' : '#2a2a3e', lineHeight: 1.5, marginBottom: 4 },
  notifTime: { fontSize: 11, color: dark ? '#555' : '#bbb' },
  readBtn: {
    padding: '4px 12px', background: 'none',
    border: '1px solid #6c63ff55',
    borderRadius: 6, color: '#6c63ff',
    fontSize: 12, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
});
