import axiosInstance from '../axios.instance';
import { Setting } from '@/types';

export const settingsService = {
  findAll: async () => (await axiosInstance.get('/settings')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/settings/${id}`)).data,
  create: async (payload: Partial<Setting>) => (await axiosInstance.post('/settings', payload)).data,
  update: async (id: string, payload: Partial<Setting>) => (await axiosInstance.patch(`/settings/${id}`, payload)).data,
  remove: async (id: string) => (await axiosInstance.delete(`/settings/${id}`)).data,
};
