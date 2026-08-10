import axiosInstance from '../axios.instance';
import { Role } from '@/types';

export const rolesService = {
  findAll: async () => (await axiosInstance.get('/roles')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/roles/${id}`)).data,
  create: async (payload: Partial<Role>) => (await axiosInstance.post('/roles', payload)).data,
  update: async (id: string, payload: Partial<Role>) => (await axiosInstance.patch(`/roles/${id}`, payload)).data,
  updatePermissions: async (id: string, permissionIds: string[]) => (await axiosInstance.patch(`/roles/${id}/permissions`, { permissionIds })).data,
  remove: async (id: string) => (await axiosInstance.delete(`/roles/${id}`)).data,
};
