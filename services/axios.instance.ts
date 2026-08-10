import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { PaginatedResponse } from '@/types/common';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Menambahkan tipe InternalAxiosRequestConfig pada parameter config
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('accessToken');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Menambahkan tipe AxiosResponse dan AxiosError
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('accessToken');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// ==========================================
// CRUD FACTORY - THE ULTIMATE DRY PATTERN
// ==========================================
export const createCrudService = <T, CreateDto = Partial<T>, UpdateDto = Partial<T>>(endpoint: string) => ({
  findAll: async (params?: any) => {
    const { data } = await axiosInstance.get<PaginatedResponse<T>>(endpoint, { params });
    return data;
  },
  findOne: async (id: string) => {
    const { data } = await axiosInstance.get<T>(`${endpoint}/${id}`);
    return data;
  },
  create: async (payload: CreateDto) => {
    const { data } = await axiosInstance.post<T>(endpoint, payload);
    return data;
  },
  update: async (id: string, payload: UpdateDto) => {
    const { data } = await axiosInstance.patch<T>(`${endpoint}/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await axiosInstance.delete<T>(`${endpoint}/${id}`);
    return data;
  },
});