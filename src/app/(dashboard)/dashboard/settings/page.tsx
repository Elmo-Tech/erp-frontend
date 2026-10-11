"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LookupOptionsManager } from '@/features/settings/components/LookupOptionsManager';
import { TagsManager } from '@/features/settings/components/TagsManager';
import { GoogleDriveSettings } from '@/features/settings/components/GoogleDriveSettings';
import { HrPoliciesSettings } from '@/features/hr/components/HrPoliciesSettings';
import { LeaveTypesSettings } from '@/features/hr/components/LeaveTypesSettings';
import { DeductionTypesSettings } from '@/features/hr/components/DeductionTypesSettings';
import { useAuthStore } from '@/store/authStore';
import { isModuleEnabled, moduleKeys } from '@/config/simplification';

export default function SettingsPage() {
  return <Suspense fallback={<p>Loading settings...</p>}><SettingsContent /></Suspense>;
}

function SettingsContent() {
  const canManageLeaveTypes = useAuthStore((state) => state.hasPermission('manage_leave_types'));
  const searchParams = useSearchParams();
  const canConfigureDeductionTypes = isModuleEnabled(moduleKeys.financials);

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

      <Tabs defaultValue={searchParams.get('tab') === 'google_drive' ? 'google_drive' : 'specializations'} className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start">
           <TabsTrigger value="specializations">Specializations</TabsTrigger>
           <TabsTrigger value="categories">Task Categories</TabsTrigger>
           <TabsTrigger value="project_types">Project Types</TabsTrigger>
           <TabsTrigger value="project_statuses">Project Statuses</TabsTrigger>
            <TabsTrigger value="task_statuses">Task Statuses</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
			<TabsTrigger value="google_drive">Google Drive</TabsTrigger>
            <TabsTrigger value="hr_policies">HR Policies</TabsTrigger>
            {canManageLeaveTypes && <TabsTrigger value="leave_types">Leave Types</TabsTrigger>}
             {canConfigureDeductionTypes && <TabsTrigger value="deduction_types">Deduction Types</TabsTrigger>}
            <TabsTrigger value="contract_durations">Contract Durations</TabsTrigger>
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

        <TabsContent value="project_types" className="space-y-4">
          <LookupOptionsManager
            type="project_type"
            title="Project Types"
            description="Manage the types used to classify projects. Active types are available when creating and editing projects."
          />
        </TabsContent>

        <TabsContent value="project_statuses" className="space-y-4">
          <LookupOptionsManager 
            type="project_status" 
            title="Project Statuses" 
            description="Manage the statuses used to track project lifecycle. Core statuses cannot be deleted or renamed." 
          />
        </TabsContent>

        <TabsContent value="task_statuses" className="space-y-4">
          <LookupOptionsManager 
            type="task_status" 
            title="Task Statuses" 
            description="Manage the statuses used to track task progress. Core statuses cannot be deleted or renamed." 
          />
        </TabsContent>
        
        <TabsContent value="tags" className="space-y-4">
          <TagsManager />
        </TabsContent>

		<TabsContent value="google_drive" className="space-y-4">
			<GoogleDriveSettings oauthError={searchParams.get('googleDrive') === 'error'} />
		</TabsContent>

        <TabsContent value="hr_policies" className="space-y-4">
          <HrPoliciesSettings />
        </TabsContent>

        {canManageLeaveTypes && (
          <TabsContent value="leave_types" className="space-y-4">
            <LeaveTypesSettings />
          </TabsContent>
        )}

        {canConfigureDeductionTypes && <TabsContent value="deduction_types" className="space-y-4">
          <DeductionTypesSettings />
        </TabsContent>}

        <TabsContent value="contract_durations" className="space-y-4">
          <LookupOptionsManager
            type="contract_duration"
            title="Contract Durations"
            description="Manage preset contract lengths (e.g. 3, 6, 12, 24 months). The value is stored as months on the contract; presets here speed up entry."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
