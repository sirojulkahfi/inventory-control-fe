import axiosInstance from '../axios.instance';

export const inboundReceiveService = {
  findAll: async () => (await axiosInstance.get('/inbound-receive')).data,
  findOne: async (id: string) => (await axiosInstance.get(`/inbound-receive/${id}`)).data,
  create: async (data: any) => (await axiosInstance.post('/inbound-receive', data)).data,
  update: async (id: string, data: any) => (await axiosInstance.patch(`/inbound-receive/${id}`, data)).data,
  receive: async (id: string) => (await axiosInstance.post(`/inbound-receive/${id}/receive`)).data,
  remove: async (id: string) => (await axiosInstance.delete(`/inbound-receive/${id}`)).data,
};
