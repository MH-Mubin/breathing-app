import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for development
// Railway: Environment variables are baked in during build time
const baseURL = import.meta.env.VITE_API_URL 
	? `${import.meta.env.VITE_API_URL}/api`
	: '/api';

const api = axios.create({
	baseURL
});

// Log API configuration once on startup
console.log('API configured:', baseURL);

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to check if error is retryable
const isRetryableError = (error) => {
	// Retry on network errors or 5xx server errors
	if (!error.response) {
		return true; // Network error
	}
	
	const status = error.response.status;
	return status >= 500 && status < 600; // Server errors
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// attach token if present
api.interceptors.request.use(config => {
	const token = localStorage.getItem('token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	
	// Initialize retry count if not present
	if (!config.retryCount) {
		config.retryCount = 0;
	}
	
	return config;
});

// Handle 401 responses globally and implement retry logic
api.interceptors.response.use(
	response => response,
	async error => {
		const config = error.config;
		
		// If we get a 401 response, clear authentication and redirect to login
		if (error.response?.status === 401) {
			// Clear token from localStorage
			localStorage.removeItem('token');
			
			// Dispatch a custom event that AuthContext can listen to
			window.dispatchEvent(new CustomEvent('auth:unauthorized'));
			
			return Promise.reject(error);
		}
		
		// Check if we should retry
		if (isRetryableError(error) && config.retryCount < MAX_RETRIES) {
			config.retryCount += 1;
			
			// Wait before retrying
			await delay(RETRY_DELAY * config.retryCount);
			
			// Retry the request
			return api(config);
		}
		
		return Promise.reject(error);
	}
);

export default api;
