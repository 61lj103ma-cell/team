import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 401 Unauthorized or Token Expired
      if (error.response.status === 401) {
        const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
        if (!isAuthRoute) {
          localStorage.removeItem('flowpilot_token');
          localStorage.removeItem('flowpilot_user');
          // Redirect to login if token is expired
          window.location.href = '/login?session=expired';
        }
      }
      return Promise.reject(error.response.data || { message: 'An API error occurred' });
    }
    return Promise.reject({ message: error.message || 'Network connection failed' });
  }
);

export default api;
