import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Leaves() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  const load = () => api('/api/leaves').then(setLeaves).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api('/api/leaves', { method: 'POST', body: JSON.stringify(form) });
      setSuccess('Leave request submitted!');
      setForm({ start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api(`/api/leaves/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const s = styles(dark);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Leave Requests</h1>
          <p style={s.sub}>{leaves.length} total request{leaves.length !== 1 ? 's' : ''}</p>
        </div>
        {!isAdmin && (
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Request Leave'}
          </button>
        )}
      </div>

      {success && <div style={s.success}>{success}</div>}

      {showForm && !isAdmin && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Leave Request</h3>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Start Date</label>
                <input
                  type="date" style={s.input}
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>End Date</label>
                <input
                  type="date" style={s.input}
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Reason (optional)</label>
              <textarea
                style={s.textarea}
                placeholder="Vacation, medical, personal..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                rows={2}
              />
            </div>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      <div style={s.list}>
        {leaves.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <div>No leave requests yet</div>
          </div>
        ) : (
          leaves.map(leave => (
            <div key={leave.id} style={s.leaveCard}>
              <div style={s.leaveLeft}>
                <div style={s.leaveName}>{leave.user_name}</div>
                <div style={s.leaveDates}>
                  📅 {leave.start_date} → {leave.end_date}
                </div>
                {leave.reason && (
                  <div style={s.leaveReason}>{leave.reason}</div>
                )}
                <div style={s.leaveDate}>
                  Submitted {leave.created_at ? new Date(leave.created_at).toLocaleDateString() : ''}
                </div>
              </div>
              <div style={s.leaveRight}>
                <span style={{ ...s.statusBadge, ...statusColor(leave.status) }}>
                  {leave.status}
                </span>
                {isAdmin && leave.status === 'pending' && (
                  <div style={s.actionBtns}>
                    <button style={s.approveBtn} onClick={() => handleStatus(leave.id, 'approved')}>
                      ✓ Approve
                    </button>
                    <button style={s.rejectBtn} onClick={() => handleStatus(leave.id, 'rejected')}>
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const statusColor = (status) => {
  if (status === 'approved') return { background: '#00c85322', color: '#00c853', borderColor: '#00c85544' };
  if (status === 'rejected') return { background: '#ff4d4d22', color: '#ff4d4d', borderColor: '#ff4d4d44' };
  return { background: '#f5a62322', color: '#f5a623', borderColor: '#f5a62344' };
};

const styles = (dark) => ({
  page: { padding: '32px', maxWidth: 800, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e', letterSpacing: '-0.5px' },
  sub: { margin: '4px 0 0', color: dark ? '#888' : '#777', fontSize: 14 },
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  success: { background: '#00c85322', border: '1px solid #00c85355', color: '#00c853', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 },
  formCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '24px', marginBottom: 24,
  },
  formTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e' },
  error: { background: '#ff4d4d22', border: '1px solid #ff4d4d55', color: '#ff6b6b', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: dark ? '#aaa' : '#555' },
  input: {
    width: '100%', padding: '10px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8, color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8, color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    resize: 'vertical', fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  submitBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  empty: { textAlign: 'center', padding: '60px 20px', color: dark ? '#666' : '#bbb', fontSize: 14 },
  leaveCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '18px 20px',
    gap: 16,
  },
  leaveLeft: { flex: 1 },
  leaveName: { fontSize: 15, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e', marginBottom: 4 },
  leaveDates: { fontSize: 14, color: dark ? '#aaa' : '#555', marginBottom: 4 },
  leaveReason: { fontSize: 13, color: dark ? '#888' : '#777', marginBottom: 4, fontStyle: 'italic' },
  leaveDate: { fontSize: 11, color: dark ? '#555' : '#bbb' },
  leaveRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 },
  statusBadge: {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.5px', borderRadius: 6, padding: '3px 10px',
    border: '1px solid transparent',
  },
  actionBtns: { display: 'flex', gap: 8 },
  approveBtn: {
    padding: '6px 14px',
    background: '#00c85322', border: '1px solid #00c85544',
    borderRadius: 7, color: '#00c853',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  rejectBtn: {
    padding: '6px 14px',
    background: '#ff4d4d18', border: '1px solid #ff4d4d33',
    borderRadius: 7, color: '#ff6b6b',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
});
