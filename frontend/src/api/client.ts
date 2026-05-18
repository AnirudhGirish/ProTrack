import axios from 'axios';

// In production (Vercel), VITE_API_URL = https://your-app.railway.app/api/v1
// In local dev, it falls back to /api/v1 which is proxied to localhost:8000 by Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s — prevents hanging requests in production
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('employee_id');
      // On session expiry: clean state and send to landing page (not /login)
      // This matches the logout flow and avoids the /login redirect loop
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
