import { apiClient } from './apiClient';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: string;
  version: string;
}

export const healthService = {
  check: async (): Promise<HealthStatus> => {
    const { data } = await apiClient.get<{ data: HealthStatus }>('/health');
    return data.data;
  },
};
