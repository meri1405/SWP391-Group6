import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',  // Remove /api from baseURL
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // If no token is found, redirect to login
            window.location.href = '/login';
            return Promise.reject('No authentication token found');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized error
            console.error('Authentication error:', error.response?.data || error.message);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 