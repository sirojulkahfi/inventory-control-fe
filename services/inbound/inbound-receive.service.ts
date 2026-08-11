import axiosInstance from '../axios.instance';

export const inboundReceiveService = {
  findAll: async () => (await axiosInstance.get('/manifest')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/manifest/${id}`)).data,
  create: async (data: any) => (await axiosInstance.post('/manifest', data)).data,
  update: async (id: string, data: any) => (await axiosInstance.put(`/manifest/${id}`, data)).data,
  receive: async (id: string, nameReceived?: string) => (await axiosInstance.post(`/manifest/${id}/receive`, { nameReceived })).data,
  remove: async (id: string) => (await axiosInstance.delete(`/manifest/${id}`)).data,
};
