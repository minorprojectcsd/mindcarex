// API Configuration
// Set these environment variables or update the defaults for production

export const API_CONFIG = {
  // Spring Boot Backend (handles auth, sessions, schedules, messages, WebSocket)
  SPRING_BOOT_URL: import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080/api',
  
  // Flask ML Backend (handles emotion analysis, chat analysis, session summaries)
  FLASK_URL: import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000/api',
  
  // WebSocket URL for real-time features
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws',
  
  // Toggle between mock data and real backends
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || true, // Set to false when backends are ready
  
  // Use Supabase directly (bypasses Spring Boot for data operations)
  USE_SUPABASE_DIRECT: import.meta.env.VITE_USE_SUPABASE_DIRECT === 'true' || true,
};

// Helper to get auth token for API calls
export const getAuthToken = (): string | null => {
  return localStorage.getItem('supabase_token');
};

// Common headers for Spring Boot API calls
export const getSpringHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
});

// Common headers for Flask API calls
export const getFlaskHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});
