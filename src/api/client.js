import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  validateStatus: (status) => status < 500,
});

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pending requests map to prevent duplicate calls
const pendingRequests = new Map();

// Add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Request deduplication for GET requests
    if (config.method === 'get') {
      const requestKey = config.url + JSON.stringify(config.params);
      
      // Check cache first
      const cached = cache.get(requestKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached data immediately
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          });
        };
        return config;
      }
      
      // Check if same request is already pending
      if (pendingRequests.has(requestKey)) {
        // Wait for the pending request instead of making a new one
        config.adapter = () => pendingRequests.get(requestKey);
        return config;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for caching
api.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === 'get') {
      const requestKey = response.config.url + JSON.stringify(response.config.params);
      
      cache.set(requestKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      
      // Remove from pending requests
      pendingRequests.delete(requestKey);
      
      // Clean old cache entries (keep last 100)
      if (cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
    }
    return response;
  },
  (error) => {
    // Remove from pending requests on error
    if (error.config?.method === 'get') {
      const requestKey = error.config.url + JSON.stringify(error.config.params);
      pendingRequests.delete(requestKey);
    }
    return Promise.reject(error);
  }
);