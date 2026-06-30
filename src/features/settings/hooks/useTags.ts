import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { TagFormData } from '../types';
import { fetchTags, createTag, updateTag, deleteTag } from '../api/tagsApi';

type ApiError = AxiosError<{ message?: string }>;

const errorMessage = (error: ApiError, fallback: string) => error.response?.data?.message || fallback;

export const useTags = () => {
  return useQuery({
    queryKey: ['settings', 'tags'],
    queryFn: fetchTags,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: (error: ApiError) => {
      toast.error(errorMessage(error, 'Failed to create tag'));
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TagFormData> }) => updateTag(id, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: (error: ApiError) => {
      toast.error(errorMessage(error, 'Failed to update tag'));
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: (response) => {
      toast.success(response?.message || 'Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: (error: ApiError) => {
      toast.error(errorMessage(error, 'Failed to delete tag'));
    },
  });
};
