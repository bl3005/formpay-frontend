import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token
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

// Auth Services
export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Form Services
export const createForm = async (formData) => {
  const response = await api.post('/forms', formData);
  return response.data;
};

export const getForms = async () => {
  const response = await api.get('/forms');
  return response.data;
};

export const getFormById = async (id) => {
  const response = await api.get(`/forms/${id}`);
  return response.data;
};

export const getFormSubmissions = async (id) => {
  const response = await api.get(`/forms/${id}/submissions`);
  return response.data;
};

export const updateForm = async (id, formData) => {
  const response = await api.put(`/forms/${id}`, formData);
  return response.data;
};

export const deleteForm = async (id) => {
  const response = await api.delete(`/forms/${id}`);
  return response.data;
};

// Public Services
export const getPublicForm = async (id) => {
  // Using regular axios to bypass the token interceptor if needed, or api since it's public anyway
  const response = await axios.get(`${API_URL}/forms/public/${id}`);
  return response.data;
};

export const submitForm = async (id, answers, paymentId) => {
  const response = await axios.post(`${API_URL}/forms/${id}/submit`, { answers, paymentId });
  return response.data;
};

export const createPaymentIntent = async (formId) => {
  const response = await axios.post(`${API_URL}/payments/create-payment-intent`, { formId });
  return response.data;
};

export const confirmPayment = async (paymentId, cardDetails) => {
  const response = await axios.post(`${API_URL}/payments/${paymentId}/confirm`, cardDetails);
  return response.data;
};
