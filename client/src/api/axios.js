import axios from 'axios';

/**
 * Configured Axios instance for Educator LMS API.
 * Automatically attaches Bearer token from localStorage.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('educator_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('educator_token');
      localStorage.removeItem('educator_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
