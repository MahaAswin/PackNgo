import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot default port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for JWT if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
