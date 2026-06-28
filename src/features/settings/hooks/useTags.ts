import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create tag');
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update tag');
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete tag');
    },
  });
};
