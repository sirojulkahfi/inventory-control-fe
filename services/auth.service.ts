import axiosInstance from './axios.instance';
export const authService = {
  login: async (payload: Record<string, unknown>) => (await axiosInstance.post('/auth/login', payload)).data,
  register: async (payload: Record<string, unknown>) => (await axiosInstance.post('/auth/register', payload)).data,
};