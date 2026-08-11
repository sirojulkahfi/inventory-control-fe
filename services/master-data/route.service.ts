import axiosInstance from '../axios.instance';

export const routeService = {
  findAll: async () => (await axiosInstance.get('/route')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/route/${id}`)).data,
  create: async (data: any) => (await axiosInstance.post('/route', data)).data,
  update: async (id: string, data: any) => (await axiosInstance.put(`/route/${id}`, data)).data,
  remove: async (id: string) => (await axiosInstance.delete(`/route/${id}`)).data,
};
