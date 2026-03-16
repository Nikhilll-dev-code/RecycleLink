import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const activeRole = sessionStorage.getItem('rl_active_role');
    const token = activeRole ? localStorage.getItem(`rl_token_${activeRole}`) : null;
    
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
};

export const residentAPI = {
  getHistory: () => api.get('/pickups/user'),
  requestPickup: (data) => api.post('/pickups', data),
};

export const driverAPI = {
  getRoutes: () => api.get('/driver/routes'),
  verifyPickup: (data) => api.post('/driver/verify', data),
  updateStatus: (data) => api.put('/pickups/status', data),
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getFleet: () => api.get('/admin/fleet'),
  assignDriver: (data) => api.post('/admin/assign', data),
  getAllDrivers: () => api.get('/admin/fleet'), // Returns driver profiles
};

export default api;
