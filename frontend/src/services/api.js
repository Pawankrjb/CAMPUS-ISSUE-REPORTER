import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token and cancel unauthorized status updates
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cancel status update requests for non-maintainers
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
      if (config.url && config.url.match(/\/reports\/[^/]+\/status$/)) {
        if (user.role !== 'maintainer') {
          // Cancel the request
          return Promise.reject(new axios.Cancel('Access denied: Only maintainers can update status'));
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    // Swallow canceled requests and 403 errors for read-only users
    // These are expected when non-maintainers try to access update endpoints
    if (axios.isCancel(error)) {
      console.warn('Request canceled:', error.message);
      return Promise.reject(error);
    }
    if (error.response && error.response.status === 403) {
      console.warn('Access denied - this is expected for read-only users');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;