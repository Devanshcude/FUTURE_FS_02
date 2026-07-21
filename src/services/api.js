import axios from 'axios';

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  return window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: inject JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Leads API
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getStats: () => api.get('/leads/stats'),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
  addNote: (id, content) => api.post(`/leads/${id}/notes`, { content }),
  updateNote: (id, noteId, content) =>
    api.put(`/leads/${id}/notes/${noteId}`, { content }),
  deleteNote: (id, noteId) => api.delete(`/leads/${id}/notes/${noteId}`),
  addFollowUp: (id, data) => api.post(`/leads/${id}/followups`, data),
  updateFollowUp: (id, followUpId, data) =>
    api.put(`/leads/${id}/followups/${followUpId}`, data),
};

export default api;
