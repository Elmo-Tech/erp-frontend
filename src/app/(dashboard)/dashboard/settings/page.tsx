"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LookupOptionsManager } from '@/features/settings/components/LookupOptionsManager';
import { TagsManager } from '@/features/settings/components/TagsManager';

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage system configuration and lookup data.
          </p>
        </div>
      </div>

      <Tabs defaultValue="specializations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="specializations">Specializations</TabsTrigger>
          <TabsTrigger value="categories">Task Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="specializations" className="space-y-4">
          <LookupOptionsManager 
            type="specialization" 
            title="User Specializations" 
            description="Manage the specializations assigned to users and employees. These appear in user profile forms and are used for task filtering." 
          />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <LookupOptionsManager 
            type="task_category" 
            title="Task Categories" 
            description="Manage the categories used to classify tasks. Categories help organize and filter tasks by type of work." 
          />
        </TabsContent>
        
        <TabsContent value="tags" className="space-y-4">
          <TagsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
