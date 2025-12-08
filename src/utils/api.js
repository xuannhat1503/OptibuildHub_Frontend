// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};
