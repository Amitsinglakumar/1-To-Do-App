import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const unwrap = (request) => request.then((response) => response.data);

export const registerUser = (data) => unwrap(api.post('/auth/register', data));
export const loginUser = (data) => unwrap(api.post('/auth/login', data));
export const googleLogin = (credential) => unwrap(api.post('/auth/google', { credential }));
export const getMe = () => unwrap(api.get('/auth/me'));

export const getTasks = (filters = {}) => unwrap(api.get('/tasks', { params: filters }));
export const createTask = (data) => unwrap(api.post('/tasks', data));
export const updateTask = (id, data) => unwrap(api.put(`/tasks/${id}`, data));
export const deleteTask = (id) => unwrap(api.delete(`/tasks/${id}`));
export const getDashboardStats = () => unwrap(api.get('/dashboard/stats'));

export const getErrorMessage = (error, fallback = 'Something went wrong') => (
    error?.response?.data?.message || error?.message || fallback
);

export default api;
