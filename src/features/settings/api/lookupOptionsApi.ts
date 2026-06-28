import { api } from '@/lib/axios';
import { LookupOption, LookupOptionFormData, LookupType, ApiResponse } from '../types';

export const fetchLookupOptions = async (type: LookupType): Promise<ApiResponse<LookupOption[]>> => {
  const response = await api.get(`/settings/lookup-options?type=${type}`);
  return response.data;
};

export const createLookupOption = async (data: LookupOptionFormData): Promise<ApiResponse<LookupOption>> => {
  const response = await api.post('/settings/lookup-options', data);
  return response.data;
};

export const updateLookupOption = async (id: number, data: Partial<LookupOptionFormData>): Promise<ApiResponse<LookupOption>> => {
  const response = await api.put(`/settings/lookup-options/${id}`, data);
  return response.data;
};

export const deleteLookupOption = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/settings/lookup-options/${id}`);
  return response.data;
};

export const reorderLookupOptions = async (items: { id: number; sort_order: number }[]): Promise<ApiResponse<null>> => {
  const response = await api.put('/settings/lookup-options/reorder', { items });
  return response.data;
};
