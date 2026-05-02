import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function Employees() {
  const { dark } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loadEmployees = () => {
    api('/api/employees').then(setEmployees).catch(() => {});
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api('/api/employees', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess('Employee added successfully!');
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the company?`)) return;
    try {
      await api(`/api/employees/${id}`, { method: 'DELETE' });
      loadEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  const s = styles(dark);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Employees</h1>
          <p style={s.sub}>{employees.length} team member{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.addBtn} onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
          {showForm ? '✕ Cancel' : '+ Add Employee'}
        </button>
      </div>

      {success && <div style={s.success}>{success}</div>}

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Employee</h3>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleAdd} style={s.form}>
            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  placeholder="Jane Doe"
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
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Temp Password</label>
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
            </div>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </form>
        </div>
      )}

      <div style={s.grid}>
        {employees.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div>No employees yet. Add your first team member!</div>
          </div>
        ) : (
          employees.map(emp => (
            <div key={emp.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.avatar}>{emp.name?.charAt(0)?.toUpperCase()}</div>
                <button
                  style={s.deleteBtn}
                  onClick={() => handleDelete(emp.id, emp.name)}
                  title="Remove employee"
                >
                  ✕
                </button>
              </div>
              <div style={s.empName}>{emp.name}</div>
              <div style={s.empEmail}>{emp.email}</div>
              <div style={s.empMeta}>
                <span style={s.roleBadge}>employee</span>
                <span style={s.joinDate}>
                  Joined {emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = (dark) => ({
  page: { padding: '32px', maxWidth: 1100, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
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
  success: {
    background: '#00c85322', border: '1px solid #00c85355',
    color: '#00c853', borderRadius: 8, padding: '10px 14px',
    marginBottom: 16, fontSize: 13,
  },
  formCard: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '24px', marginBottom: 24,
  },
  formTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e' },
  error: {
    background: '#ff4d4d22', border: '1px solid #ff4d4d55',
    color: '#ff6b6b', borderRadius: 8, padding: '10px 14px',
    marginBottom: 16, fontSize: 13,
  },
  form: {},
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  field: {},
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: dark ? '#aaa' : '#555' },
  input: {
    width: '100%', padding: '10px 14px',
    background: dark ? '#222230' : '#f8f9fc',
    border: `1px solid ${dark ? '#333' : '#dde1ec'}`,
    borderRadius: 8, color: dark ? '#f0f0f5' : '#1a1a2e',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  submitBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  empty: {
    gridColumn: '1/-1',
    textAlign: 'center',
    padding: '60px 20px',
    color: dark ? '#666' : '#bbb',
    fontSize: 14,
  },
  card: {
    background: dark ? '#18181f' : '#fff',
    border: `1px solid ${dark ? '#2a2a35' : '#e8eaf2'}`,
    borderRadius: 12, padding: '20px',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  avatar: {
    width: 48, height: 48, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #48a9fe)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 18,
  },
  deleteBtn: {
    background: 'none', border: 'none',
    color: dark ? '#555' : '#ccc',
    cursor: 'pointer', fontSize: 12, padding: 4,
  },
  empName: { fontSize: 15, fontWeight: 700, color: dark ? '#f0f0f5' : '#1a1a2e', marginBottom: 2 },
  empEmail: { fontSize: 12, color: dark ? '#888' : '#777', marginBottom: 10 },
  empMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roleBadge: {
    background: '#6c63ff22', color: '#6c63ff',
    fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 6,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  joinDate: { fontSize: 11, color: dark ? '#555' : '#bbb' },
});
