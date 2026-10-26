"use client";

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LookupOption, LookupType } from '../types';
import { useLookupOptions, useDeleteLookupOption } from '../hooks/useLookupOptions';
import { LookupOptionForm } from './LookupOptionForm';
import { handleApiError } from '@/lib/errorHandling';
import { useAuthStore } from '@/store/authStore';

interface LookupOptionsManagerProps {
  type: LookupType;
  title: string;
  description: string;
}

export function LookupOptionsManager({ type, title, description }: LookupOptionsManagerProps) {
  const { hasPermission: has } = useAuthStore((state) => state);
  const resource = { specialization: 'specializations', task_category: 'task_categories', project_type: 'project_types', project_status: 'project_statuses', task_status: 'task_statuses', contract_duration: 'contract_durations' }[type];
  const can = (action: string) => has('manage_lookup_options') || has(`manage_${resource}`) || has(`${action}_${resource}`);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<LookupOption | undefined>();
  const [optionToDelete, setOptionToDelete] = useState<LookupOption | null>(null);

  const { data: response, isLoading } = useLookupOptions(type);
  const deleteMutation = useDeleteLookupOption();
  // Drag and drop is omitted for simplicity in this version, could be added later with @dnd-kit

  const options = response?.data || [];

  const handleAdd = () => {
    setSelectedOption(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (option: LookupOption) => {
    setSelectedOption(option);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (optionToDelete) {
      deleteMutation.mutate(optionToDelete.id, {
        onSuccess: () => setOptionToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {can('create') && <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
              <Settings className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm font-medium">No options found</p>
              <p className="text-sm text-muted-foreground mb-4">Add your first option to get started.</p>
              {can('create') && <Button variant="outline" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>}
            </div>
          ) : (
            <div className="rounded-md border">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== options.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 cursor-grab" />
                    
                    <div 
                      className={`w-4 h-4 rounded-full border shadow-sm ${option.color?.startsWith('bg-') ? option.color.split(' ')[0] : ''}`}
                      style={{ 
                        backgroundColor: option.color && !option.color.startsWith('bg-') ? option.color : 'transparent' 
                      }}
                    />
                    
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {option.value}
                        </Badge>
                        {!option.is_active && (
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {can('edit') && <Button aria-label={`Edit ${option.label}`} variant="ghost" size="icon" onClick={() => handleEdit(option)}>
                      <Pencil className="w-4 h-4" />
                    </Button>}
                    {can('delete') && <Button
                      aria-label={`Delete ${option.label}`}
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { deleteMutation.reset(); setOptionToDelete(option); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LookupOptionForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        type={type} 
        option={selectedOption} 
      />

      <AlertDialog open={!!optionToDelete} onOpenChange={(open) => !open && setOptionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              <strong> {optionToDelete?.label} </strong> option. 
              Project types linked to projects cannot be deleted. Deactivate a type to hide it from new projects while preserving existing records, or reassign its projects first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && <div role="alert" className="max-h-64 overflow-y-auto rounded-lg border border-destructive p-3 text-sm text-destructive">{handleApiError(deleteMutation.error)}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
