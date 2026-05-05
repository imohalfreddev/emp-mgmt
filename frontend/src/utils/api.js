const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }

  // Prevents "unexpected end of JSON input" errors on 204 responses
  if (res.status === 204) {
    return null;
  }

  return res.json();
};

export default api;