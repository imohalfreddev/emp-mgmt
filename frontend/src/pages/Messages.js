import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Messages() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ content: '', receiver_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    api('/api/messages').then(setMessages).catch(() => {});
    if (isAdmin) {
      api('/api/employees').then(setEmployees).catch(() => {});
    }
  }, [isAdmin]);

  const handleSend = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: form.content,
          receiver_id: form.receiver_id ? parseInt(form.receiver_id) : null,
        }),
      });
      setSuccess('Message sent!');
      setForm({ content: '', receiver_id: '' });
      api('/api/messages').then(setMessages).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(dark);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Messages</h1>
          <p style={s.sub}>{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {isAdmin && (
        <div style={s.composeCard}>
          <h3 style={s.composeTitle}>Send Message</h3>
          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.successBanner}>{success}</div>}
          <form onSubmit={handleSend}>
            <div style={s.field}>
              <label style={s.label}>Recipient</label>
              <select
                style={s.select}
                value={form.receiver_id}
                onChange={e => setForm({ ...form, receiver_id: e.target.value })}
              >
                <option value="">📢 All Employees (Broadcast)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Message</label>
              <textarea
                style={s.textarea}
                placeholder="Write your message..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
                rows={3}
              />
            </div>
            <button type="submit" style={s.sendBtn} disabled={loading}>
              {loading ? 'Sending...' : '✉️ Send Message'}
            </button>
          </form>
        </div>
      )}

      <div style={s.messageList}>
        {messages.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
            <div>No messages yet</div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={s.msgCard}>
              <div style={s.msgHeader}>
                <div style={s.msgAvatarWrap}>
                  <div style={s.msgAvatar}>{msg.sender_name?.charAt(0)?.toUpperCase()}</div>
                  <div>
                    <div style={s.msgSender}>{msg.sender_name}</div>
                    <div style={s.msgTo}>
                      → {msg.receiver_name || '📢 All Employees'}
                    </div>
                  </div>
                </div>
                <div style={s.msgTime}>
                  {msg.created_at ? new Date(msg.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : ''}
                </div>
              </div>
              <div style={s.msgContent}>{msg.content}</div>
              {!msg.receiver_id && (
                <div style={s.broadcastTag}>📢 Broadcast</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = (dark) => ({
  page: { padding: '32px', maxWidth: 800, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  header: { marginBottom: 24 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e', letterSpacing: '-0.5px' },
  sub: { margin: '4px 0 0', color: dark ? '#888' : '#777', fontSize: 14 },
  composeCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '24px', marginBottom: 24,
  },
  composeTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e' },
  error: { background: '#ff4d4d22', border: '1px solid #ff4d4d55', color: '#ff6b6b', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 },
  successBanner: { background: '#00c85322', border: '1px solid #00c85355', color: '#00c853', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 },
  field: { marginBottom: 14 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: dark ? '#aaa' : '#555' },
  select: {
    width: '100%', padding: '10px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8, color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    appearance: 'none',
  },
  textarea: {
    width: '100%', padding: '10px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8, color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    resize: 'vertical', fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  sendBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  messageList: { display: 'flex', flexDirection: 'column', gap: 12 },
  empty: { textAlign: 'center', padding: '60px 20px', color: dark ? '#666' : '#bbb', fontSize: 14 },
  msgCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '18px 20px',
  },
  msgHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  msgAvatarWrap: { display: 'flex', gap: 10, alignItems: 'center' },
  msgAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  msgSender: { fontSize: 14, fontWeight: 600, color: dark ? '#f0f0f5' : '#1a1a2e' },
  msgTo: { fontSize: 12, color: dark ? '#666' : '#aaa', marginTop: 2 },
  msgTime: { fontSize: 11, color: dark ? '#555' : '#bbb', whiteSpace: 'nowrap' },
  msgContent: { fontSize: 14, color: dark ? '#ccc' : '#444', lineHeight: 1.6 },
  broadcastTag: {
    display: 'inline-block',
    marginTop: 10,
    background: '#48a9fe22', color: '#48a9fe',
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
  },
});
