// API Configuration for TechStore Backend
// Use relative URL for deployment or localhost for development
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

// Helper function for making API requests
async function fetchAPI(endpoint, options = {}) {
    try {
        // Get auth token from localStorage if it exists
        const token =  JSON.parse(localStorage.getItem('techstore_user_login') || '{}')?.token;
        
        // Set default headers
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token && { Authorization: `Bearer ${token}` })
        };
        
        /*
        // Add auth token to headers if available
        if (userInfo && userInfo.token) {
            headers['Authorization'] = `Bearer ${userInfo.token}`;
        }*/
        
        // Make the request
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // Parse the JSON response
        const data = await response.json();
        
        // Handle API errors
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        // Only log in development environment
        if (window.location.hostname === 'localhost') {
            console.error(`API Error: ${error.message}`);
        }
        throw error;
    }
}

// Auth API
const authAPI = {
    // Register a new user
    register: async (userData) => {
        return fetchAPI('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    // Login an existing user
    login: async (email, password) => {
        return fetchAPI('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    // Get user profile
    getProfile: async () => {
        return fetchAPI('/users/profile');
    }
};

// Product API
const productAPI = {
    // Get all products or filter by category
    getProducts: async (category = '') => {
        const queryParam = category && category !== 'all' ? `?category=${category}` : '';
        return fetchAPI(`/products${queryParam}`);
    },
    
    // Get a single product by ID
    getProductById: async (id) => {
        return fetchAPI(`/products/${id}`);
    }
};

// Order API
const orderAPI = {
    // Create a new order
    createOrder: async (orderData) => {
        return fetchAPI('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },
    
    // Get user's orders
    getUserOrders: async () => {
        return fetchAPI('/orders/myorders');
    },
    
    // Get a single order by ID
    getOrderById: async (id) => {
        return fetchAPI(`/orders/${id}`);
    },
    
    // Update order to paid status
    updateOrderToPaid: async (id, paymentResult) => {
        return fetchAPI(`/orders/${id}/pay`, {
            method: 'PUT',
            body: JSON.stringify(paymentResult)
        });
    }
};
