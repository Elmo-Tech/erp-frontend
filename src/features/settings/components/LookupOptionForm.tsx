"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { LookupOption, LookupType } from '../types';
import { useCreateLookupOption, useUpdateLookupOption } from '../hooks/useLookupOptions';

const formSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  value: z.string().min(1, "Value/Slug is required").max(50),
  color: z.string().max(50).optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface LookupOptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: LookupType;
  option?: LookupOption;
}

export function LookupOptionForm({ open, onOpenChange, type, option }: LookupOptionFormProps) {
  const createMutation = useCreateLookupOption();
  const updateMutation = useUpdateLookupOption();

  const isEditing = !!option;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      value: '',
      color: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (option) {
        form.reset({
          label: option.label,
          value: option.value,
          color: option.color || '',
          is_active: option.is_active,
        });
      } else {
        form.reset({
          label: '',
          value: '',
          color: '',
          is_active: true,
        });
      }
    }
  }, [open, option, form]);

  const onSubmit = (values: FormValues) => {
    if (isEditing && option) {
      updateMutation.mutate(
        { id: option.id, data: { ...values, type } },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(
        { ...values, type },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  // Auto-generate value from label if value is empty and we are creating
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('label', e.target.value);
    if (!isEditing && !form.formState.dirtyFields.value) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
      form.setValue('value', slug, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Option' : 'Add New Option'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Backend Developer" {...field} onChange={handleLabelChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value / Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. backend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Should this option be available for selection?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
