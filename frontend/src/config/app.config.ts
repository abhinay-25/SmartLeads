const API_BASE_URL = import.meta.env['VITE_API_URL'] ?? '/api';

export const appConfig = {
  apiBaseUrl: API_BASE_URL,
  appName: 'Smart Leads',
  appVersion: '1.0.0',
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  debounce: {
    search: 300,
    filter: 200,
  },
} as const;
