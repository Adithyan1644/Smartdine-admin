import axios from 'axios';

// Single source of truth: always use the correct App Engine URL
// Dev: set via VITE_CLOUD_API_URL in .env.development
// Prod: set via VITE_CLOUD_API_URL in .env.production
export const CLOUD_API_URL = import.meta.env?.VITE_CLOUD_API_URL || 'https://smartdine-saas.ew.r.appspot.com';
export const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080'; // Local Biller instance link

// Configure Axios Client with global interceptors
export const cloudClient = axios.create({
  baseURL: CLOUD_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT Bearer token into all cloud requests
cloudClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartdine_jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401/403 errors to wipe cached state and force login
cloudClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or unauthorized. Clearing credentials...");
      localStorage.removeItem('smartdine_jwt_token');
      localStorage.removeItem('smartdine_cached_analytics');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
