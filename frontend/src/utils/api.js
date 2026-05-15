import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use relative path so it uses the current domain (works with ngrok & proxy)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
