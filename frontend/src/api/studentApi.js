import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://student-management-system-2-58fe.onrender.com/api',
});

// ── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Handle 401 (expired / invalid token) ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token
      localStorage.removeItem('token');
      // Notify AuthContext / App to reset auth state
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token_expired' } }));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: ()           => api.get('/auth/me'),
};

export const studentApi = {
  getAll:          (params)         => api.get('/students', { params }),
  getStats:        ()               => api.get('/students/stats'),
  getById:         (id)             => api.get(`/students/${id}`),
  create:          (data)           => api.post('/students', data),
  update:          (id, data)       => api.put(`/students/${id}`, data),
  delete:          (id)             => api.delete(`/students/${id}`),
  uploadDocument:  (id, formData)   => api.post(`/students/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const attendanceApi = {
  get:  (course, date) => api.get('/attendance', { params: { course, date } }),
  save: (payload)      => api.post('/attendance', payload),
};

export const gradesApi = {
  getBatch:     (semester, subject) => api.get('/grades/batch', { params: { semester, subject } }),
  saveBatch:    (payload)           => api.post('/grades/batch', payload),
  getForStudent:(studentId)         => api.get(`/grades/${studentId}`),
  addGrade:     (studentId, data)   => api.post(`/grades/${studentId}`, data),
  deleteGrade:  (gradeId)           => api.delete(`/grades/${gradeId}`),
};

// ── Utility: Decode JWT payload without verifying signature ───────────────────
// Used client-side only to check expiry before making a request.
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // Add 10-second buffer so we don't try an expired token at the last moment
  return decoded.exp * 1000 < Date.now() + 10_000;
};
