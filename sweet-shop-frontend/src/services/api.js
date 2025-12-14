import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentToken = null;

instance.setToken = (token) => {
  currentToken = token;
  if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete instance.defaults.headers.common['Authorization'];
};

export default instance;
