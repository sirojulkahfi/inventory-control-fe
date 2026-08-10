import axiosInstance from './axios.instance';
export const authService = {
  login: async (payload: any) => (await axiosInstance.post('/auth/login', payload)).data,
  register: async (payload: any) => (await axiosInstance.post('/auth/register', payload)).data,
};