import axiosInstance from '../axios.instance';
import { User } from '@/types';

export const usersService = {
  findAll: async () => (await axiosInstance.get('/users')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/users/${id}`)).data,
  create: async (payload: Partial<User>) => (await axiosInstance.post('/users', payload)).data,
  update: async (id: string, payload: Partial<User>) => (await axiosInstance.patch(`/users/${id}`, payload)).data,
  remove: async (id: string) => (await axiosInstance.delete(`/users/${id}`)).data,
};
