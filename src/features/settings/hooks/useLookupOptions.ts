import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyApiError } from '@/lib/errorHandling';
import { LookupType, LookupOptionFormData } from '../types';
import {
  fetchLookupOptions,
  createLookupOption,
  updateLookupOption,
  deleteLookupOption,
  reorderLookupOptions,
} from '../api/lookupOptionsApi';


export const useLookupOptions = (type: LookupType, enabled = true) => {
  return useQuery({
    queryKey: ['settings', 'lookup-options', type],
    queryFn: () => fetchLookupOptions(type),
    enabled,
  });
};

export const useCreateLookupOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLookupOption,
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options', variables.type] });
      // Invalidate existing enum hooks so the app updates immediately
      if (variables.type === 'specialization') {
        queryClient.invalidateQueries({ queryKey: ['enums', 'user-specializations'] });
      } else if (variables.type === 'task_category') {
        queryClient.invalidateQueries({ queryKey: ['enums', 'task-categories'] });
      } else if (variables.type === 'project_status') {
        queryClient.invalidateQueries({ queryKey: ['enums', 'project-statuses'] });
      } else if (variables.type === 'task_status') {
        queryClient.invalidateQueries({ queryKey: ['enums', 'task-statuses'] });
      }
    },
    onError: notifyApiError,
  });
};

export const useUpdateLookupOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LookupOptionFormData> }) => updateLookupOption(id, data),
    onSuccess: () => {
      // We don't have the type in variables.data if it's a partial update,
      // but invalidating all lookup-options is fine for settings panel
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options'] });
      queryClient.invalidateQueries({ queryKey: ['enums'] });
    },
    onError: notifyApiError,
  });
};

export const useDeleteLookupOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLookupOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options'] });
      queryClient.invalidateQueries({ queryKey: ['enums'] });
    },
    onError: notifyApiError,
  });
};

export const useReorderLookupOptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderLookupOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'lookup-options'] });
      queryClient.invalidateQueries({ queryKey: ['enums'] });
    },
    onError: notifyApiError,
  });
};
