import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const RAW = import.meta.env.VITE_API_BASE_URL || 'https://mindcarex-backend.onrender.com,https://mindcarex-backend-amq9.onrender.com';
const [PRIMARY, BACKUP] = RAW.split(',').map((u: string) => u.trim());

const api = axios.create({
  baseURL: PRIMARY,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Failover interceptor: retry on network error or 5xx with backup URL
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    if (
      BACKUP &&
      config &&
      !config._retried &&
      (!error.response || error.response.status >= 500)
    ) {
      config._retried = true;
      config.baseURL = BACKUP;
      return api.request(config);
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('mindcarex_auth_user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Access denied');
    }
    return Promise.reject(error);
  }
);

export default api;
