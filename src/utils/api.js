// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  // If already a full URL (http/https) or data URI, return as-is
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_URL}${path}`;
};
