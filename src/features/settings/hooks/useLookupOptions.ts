import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LookupType, LookupOptionFormData } from '../types';
import {
  fetchLookupOptions,
  createLookupOption,
  updateLookupOption,
  deleteLookupOption,
  reorderLookupOptions,
} from '../api/lookupOptionsApi';

export const useLookupOptions = (type: LookupType) => {
  return useQuery({
    queryKey: ['settings', 'lookup-options', type],
    queryFn: () => fetchLookupOptions(type),
  });
};

export const useCreateLookupOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLookupOption,
    onSuccess: (response, variables) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options', variables.type] });
      // Invalidate existing enum hooks so the app updates immediately
      if (variables.type === 'specialization') {
        queryClient.invalidateQueries({ queryKey: ['enums', 'user-specializations'] });
      } else if (variables.type === 'task_category') {
        queryClient.invalidateQueries({ queryKey: ['enums', 'task-categories'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create option');
    },
  });
};

export const useUpdateLookupOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LookupOptionFormData> }) => updateLookupOption(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message);
      // We don't have the type in variables.data if it's a partial update,
      // but invalidating all lookup-options is fine for settings panel
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options'] });
      queryClient.invalidateQueries({ queryKey: ['enums'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update option');
    },
  });
};

export const useDeleteLookupOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLookupOption,
    onSuccess: (response) => {
      toast.success(response?.message || 'Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options'] });
      queryClient.invalidateQueries({ queryKey: ['enums'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete option');
    },
  });
};

export const useReorderLookupOptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderLookupOptions,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options'] });
      queryClient.invalidateQueries({ queryKey: ['enums'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reorder options');
    },
  });
};
