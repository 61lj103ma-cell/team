import axios from 'axios';
import { handleMockRequest } from './mockApiHandler';

const isBrowser = typeof window !== 'undefined';
const isRemoteHost = isBrowser && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const pointsToLocalhost = !configuredApiUrl || 
  configuredApiUrl.includes('localhost') || 
  configuredApiUrl.includes('127.0.0.1');

// When deployed on Vercel/cloud without a configured remote backend, default to demo engine
const preferMock = isRemoteHost && pointsToLocalhost;

const defaultAdapter = axios.defaults.adapter;

const smartAdapter = async (config) => {
  // If deployed online without a live remote backend URL, fulfill via mock engine
  if (preferMock) {
    const mockData = await handleMockRequest(config);
    return {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // Otherwise, attempt real network request
  try {
    const defaultFn = typeof defaultAdapter === 'function' 
      ? defaultAdapter 
      : axios.getAdapter(config.adapter || axios.defaults.adapter);
    return await defaultFn(config);
  } catch (err) {
    const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
    if (isNetworkError) {
      console.warn('[FlowPilot] Backend connection failed, falling back to Enterprise Demo Engine:', err.message);
      const mockData = await handleMockRequest(config);
      return {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
    throw err;
  }
};

const api = axios.create({
  baseURL: configuredApiUrl || 'http://localhost:5000/api',
  timeout: 30000,
  adapter: smartAdapter,
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
          window.location.href = '/login?session=expired';
        }
      }
      return Promise.reject(error.response.data || { message: 'An API error occurred' });
    }
    return Promise.reject({ message: error.message || 'Network connection failed' });
  }
);

export default api;
