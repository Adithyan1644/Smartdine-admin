import axios from 'axios';

const DEV_GATEWAY = import.meta.env?.VITE_DEV_CLOUD_API_URL || 'https://smartdine-v1-0-git-635032287458.europe-west1.run.app';
const PROD_GATEWAY = import.meta.env?.VITE_CLOUD_API_URL || 'https://smartdine-saas-prod.appspot.com'; // Production App Engine / Cloud Run URL

// Dynamically determine the active environment
const isTestEnv = JSON.parse(localStorage.getItem('smartdine_is_test')) || false;
export const CLOUD_API_URL = isTestEnv ? DEV_GATEWAY : PROD_GATEWAY;
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
