import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // Add origin header for CORS
  config.headers['Origin'] = window.location.origin;
  
  // Add authorization if token exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ 
        response: { 
          data: { message: 'No response from server' }
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({ 
        response: { 
          data: { message: error.message }
        }
      });
    }
  }
);

export default api;