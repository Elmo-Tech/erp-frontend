import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyApiError } from '@/lib/errorHandling';
import { TagFormData } from '../types';
import { fetchTags, createTag, updateTag, deleteTag } from '../api/tagsApi';


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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: notifyApiError,
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TagFormData> }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: notifyApiError,
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: notifyApiError,
  });
};
