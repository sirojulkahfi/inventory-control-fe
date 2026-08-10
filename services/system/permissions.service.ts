import axiosInstance from '../axios.instance';
import { Permission } from '@/types';

export const permissionsService = {
  findAll: async () => (await axiosInstance.get('/permissions')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/permissions/${id}`)).data,
  create: async (payload: Partial<Permission>) => (await axiosInstance.post('/permissions', payload)).data,
  update: async (id: string, payload: Partial<Permission>) => (await axiosInstance.patch(`/permissions/${id}`, payload)).data,
  remove: async (id: string) => (await axiosInstance.delete(`/permissions/${id}`)).data,
};
