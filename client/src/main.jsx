import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Global Request Interceptor: Attach token to every request automatically
axios.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Failed to parse userInfo for auth token', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Response Interceptor: Handle Token Expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response?.data?.message || '';
      if (
        msg.includes('token expired') || 
        msg.includes('token failed') || 
        error.response?.data?.type === 'expired'
      ) {
        console.warn('🔴 Token invalid/expired - redirecting to login');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
