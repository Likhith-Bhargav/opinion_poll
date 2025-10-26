import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class AuthService {
  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }

  async signin(credentials) {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
