import axiosInstance from '../axios.instance';

export const dockService = {
  findAll: async () => (await axiosInstance.get('/dock')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/dock/${id}`)).data,
  create: async (data: any) => (await axiosInstance.post('/dock', data)).data,
  update: async (id: string, data: any) => (await axiosInstance.put(`/dock/${id}`, data)).data,
  remove: async (id: string) => (await axiosInstance.delete(`/dock/${id}`)).data,
};
