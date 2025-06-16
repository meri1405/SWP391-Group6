// Get authentication headers for API requests
export const getAuthHeaders = () => {
    const token = getTokenFromStorage();
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getTokenFromStorage();
    return !!token;
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
};

// Save user data to localStorage
export const saveUserData = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
};

// Clear user data from localStorage
export const clearUserData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const getTokenFromStorage = () => {
    return localStorage.getItem('token');
};

export const setTokenToStorage = (token) => {
    localStorage.setItem('token', token);
};

export const removeTokenFromStorage = () => {
    localStorage.removeItem('token');
}; 