import axios from 'axios';
import { API_BASE_URL } from '../config';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Enable sending cookies with requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Log request for debugging
        console.log('Making request to:', config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful response for debugging
        console.log('Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);

        if (error.response?.status === 401) {
            // Only redirect to login if not already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 