import axios from 'axios';


const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/auth' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Existing
export const register = (data) => API.post('/register', data);
export const login = (data) => API.post('/login', data);
export const getMe = () => API.get('/me');

// New
export const updateProfile = (data) => API.put('/profile', data);
export const getProfile = () => API.get('/profile');
export const addStudent = (data) => API.post('/students', data);
export const getStudents = () => API.get('/students');
export const generateContent = (data) => API.post('/ai/generate', data);
export const getRecommendations = (data) => API.post('/ai/recommend', data);