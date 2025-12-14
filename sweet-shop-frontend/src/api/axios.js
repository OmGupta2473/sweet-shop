import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management helper
let currentToken = null;
instance.setToken = (token) => {
  currentToken = token;
  if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete instance.defaults.headers.common['Authorization'];
};

// Request interceptor optional: ensures token present
instance.interceptors.request.use((config) => {
  if (currentToken) config.headers['Authorization'] = `Bearer ${currentToken}`;
  return config;
});

export default instance;
