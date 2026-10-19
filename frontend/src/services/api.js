import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resumeiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract clean human-readable message
    const message =
      error.response?.data?.message ||
      (error.response?.status === 429
        ? 'Too many requests. Please wait a few moments before trying again.'
        : error.response?.status === 403
        ? 'You do not have permission to perform this action.'
        : error.response?.status === 404
        ? 'The requested resource was not found.'
        : error.response?.status >= 500
        ? 'Server temporarily unavailable. Please try again.'
        : error.message || 'An unexpected error occurred. Please try again.');

    error.userMessage = message;

    if (error.response && error.response.status === 401) {
      const currentToken = localStorage.getItem('resumeiq_token');
      if (currentToken) {
        localStorage.removeItem('resumeiq_token');
        localStorage.removeItem('resumeiq_user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
