import axiosInstance from '../axios.instance';
import { AuditLog } from '@/types';

export const auditLogsService = {
  findAll: async () => (await axiosInstance.get('/audit-logs')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/audit-logs/${id}`)).data,
};
