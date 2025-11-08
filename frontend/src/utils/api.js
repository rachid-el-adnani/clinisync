import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('clinic');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  registerClinic: (data) => 
    api.post('/auth/register-clinic', data),
  
  createStaff: (data) => 
    api.post('/auth/create-staff', data),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Patients API
export const patientsAPI = {
  getAll: () => 
    api.get('/patients'),
  
  getById: (id) => 
    api.get(`/patients/${id}`),
  
  create: (data) => 
    api.post('/patients', data),
  
  update: (id, data) => 
    api.put(`/patients/${id}`, data),
  
  delete: (id) => 
    api.delete(`/patients/${id}`),
  
  search: (query) => 
    api.get(`/patients/search?q=${query}`),
};

// Clinics API (System Admin only)
export const clinicsAPI = {
  getAll: () => 
    api.get('/clinics'),
  
  getById: (id) => 
    api.get(`/clinics/${id}`),
  
  update: (id, data) => 
    api.put(`/clinics/${id}`, data),
  
  toggleStatus: (id, isActive, reason) => 
    api.put(`/clinics/${id}/toggle-status`, { is_active: isActive, reason }),
};

// Staff API
export const staffAPI = {
  getAll: () => 
    api.get('/staff'),
  
  getById: (id) => 
    api.get(`/staff/${id}`),
  
  create: (data) => 
    api.post('/staff', data),
  
  update: (id, data) => 
    api.put(`/staff/${id}`, data),
  
  delete: (id) => 
    api.delete(`/staff/${id}`),
};

// Sessions API
export const sessionsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/sessions${params ? `?${params}` : ''}`);
  },
  
  getById: (id) => 
    api.get(`/sessions/${id}`),
  
  getSeries: (id) => 
    api.get(`/sessions/${id}/series`),
  
  createSeries: (data) => 
    api.post('/sessions/create-series', data),
  
  update: (id, data) => 
    api.put(`/sessions/${id}`, data),
  
  reschedule: (id, newStartTime) => 
    api.put(`/sessions/${id}/reschedule`, { newStartTime }),
  
  cancel: (id) => 
    api.put(`/sessions/${id}/cancel`),
  
  cancelSeries: (id) => 
    api.put(`/sessions/${id}/cancel-series`),
};

// Export api instance for direct use
export { api };

export default api;

