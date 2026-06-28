import { api } from '@/lib/axios';
import { Tag, TagFormData, ApiResponse } from '../types';

export const fetchTags = async (): Promise<ApiResponse<Tag[]>> => {
  const response = await api.get('/settings/tags');
  return response.data;
};

export const createTag = async (data: TagFormData): Promise<ApiResponse<Tag>> => {
  const response = await api.post('/settings/tags', data);
  return response.data;
};

export const updateTag = async (id: number, data: Partial<TagFormData>): Promise<ApiResponse<Tag>> => {
  const response = await api.put(`/settings/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/settings/tags/${id}`);
  return response.data;
};
