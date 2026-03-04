/**
 * Separate Axios instance for the Flask-based analysis backend.
 * Does NOT interfere with the Spring Boot api.ts client.
 *
 * Every Flask endpoint returns: { success, message?, error?, data }
 * This client unwraps automatically.
 */
import axios, { AxiosError } from 'axios';

const ANALYSIS_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://mindcarex-backend.onrender.com';

const analysisApi = axios.create({
  baseURL: ANALYSIS_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// No auth headers needed for now (all endpoints open).
// Placeholder interceptor for future JWT integration:
analysisApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Unwrap the Flask { success, data, error } envelope */
export async function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T; error?: string } }>): Promise<T> {
  const res = await promise;
  const body = res.data;
  if (!body.success) {
    throw new Error(body.error || 'Request failed');
  }
  return body.data;
}

export { ANALYSIS_BASE };
export default analysisApi;
