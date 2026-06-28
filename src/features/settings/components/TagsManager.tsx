"use client";

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag as TagIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tag } from '../types';
import { useTags, useDeleteTag } from '../hooks/useTags';
import { TagForm } from './TagForm';

export function TagsManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const { data: response, isLoading } = useTags();
  const deleteMutation = useDeleteTag();

  const tags = response?.data || [];

  const handleAdd = () => {
    setSelectedTag(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tagToDelete) {
      deleteMutation.mutate(tagToDelete.id, {
        onSuccess: () => setTagToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Manage system-wide tags used for labeling tasks and entities.</CardDescription>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
              <TagIcon className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm font-medium">No tags found</p>
              <p className="text-sm text-muted-foreground mb-4">Create some tags to organize your data.</p>
              <Button variant="outline" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-4 h-4 rounded-full border shadow-sm shrink-0 ${tag.color?.startsWith('bg-') ? tag.color.split(' ')[0] : ''}`}
                      style={{ 
                        backgroundColor: tag.color && !tag.color.startsWith('bg-') ? tag.color : 'transparent' 
                      }}
                    />
                    <div>
                      <div className="font-medium">{tag.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)} className="h-8 w-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setTagToDelete(tag)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TagForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        tag={selectedTag} 
      />

      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              <strong> {tagToDelete?.name} </strong> tag. 
              Any tasks currently using this tag will lose it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
