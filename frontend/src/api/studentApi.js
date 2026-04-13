import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Intercept requests to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

export const studentApi = {
  getAll: (params) => api.get('/students', { params }),
  getStats: () => api.get('/students/stats'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  uploadDocument: (id, formData) => api.post(`/students/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' } // Multer parsing header
  })
};

export const attendanceApi = {
  get: (course, date) => api.get('/attendance', { params: { course, date } }),
  save: (payload) => api.post('/attendance', payload)
};

export const gradesApi = {
  getBatch: (semester, subject) => api.get('/grades/batch', { params: { semester, subject } }),
  saveBatch: (payload) => api.post('/grades/batch', payload),
  getForStudent: (studentId) => api.get(`/grades/${studentId}`),
  addGrade: (studentId, data) => api.post(`/grades/${studentId}`, data),
  deleteGrade: (gradeId) => api.delete(`/grades/${gradeId}`)
};
