"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Settings2 } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LookupOptionsManager } from "@/features/settings/components/LookupOptionsManager";
import { TagsManager } from "@/features/settings/components/TagsManager";
import { GlobalWorkflowSettings } from "@/features/settings/components/GlobalWorkflowSettings";
import { GoogleDriveSettings } from "@/features/settings/components/GoogleDriveSettings";
import { HrPoliciesSettings } from "@/features/hr/components/HrPoliciesSettings";
import { LeaveTypesSettings } from "@/features/hr/components/LeaveTypesSettings";
import { DevicesSettings } from "@/features/devices/components/DevicesSettings";
import { useAuthStore } from "@/store/authStore";
import type { LookupType } from "@/features/settings/types";

const lists: { id: string; type: LookupType; label: string; permission: string }[] = [
	{ id: "specializations", type: "specialization", label: "Specializations", permission: "manage_specializations" },
	{ id: "categories", type: "task_category", label: "Task Categories", permission: "manage_task_categories" },
	{ id: "project_types", type: "project_type", label: "Project Types", permission: "manage_project_types" },
	{ id: "project_statuses", type: "project_status", label: "Project Statuses", permission: "manage_project_statuses" },
	{ id: "task_statuses", type: "task_status", label: "Task Statuses", permission: "manage_task_statuses" },
	{ id: "contract_durations", type: "contract_duration", label: "Contract Durations", permission: "manage_contract_durations" },
];

export default function SettingsPage() { return <Suspense fallback={<p>Loading settings…</p>}><SettingsContent /></Suspense>; }

function SettingsContent() {
	const { hasPermission: has } = useAuthStore((state) => state);
	const params = useSearchParams();
	const tabs = [
		...(has("manage_workflow_templates") ? [{ id: "workflow", label: "Workflow", content: <GlobalWorkflowSettings /> }] : []),
		...lists.filter((tab) => has("manage_lookup_options") || ["manage", "create", "edit", "delete", "reorder"].some((action) => has(tab.permission.replace(/^manage/, action)))).map((tab) => ({ id: tab.id, label: tab.label, content: <LookupOptionsManager type={tab.type} title={tab.label} description={`Manage ${tab.label.toLowerCase()} used throughout the system.`} /> })),
		...(has("manage_tags") ? [{ id: "tags", label: "Tags", content: <TagsManager /> }] : []),
		...(has("manage_google_drive") ? [{ id: "google_drive", label: "Google Drive", content: <GoogleDriveSettings oauthError={params.get("googleDrive") === "error"} /> }] : []),
		...(has("manage_hr_settings") ? [{ id: "hr_policies", label: "HR Policies", content: <HrPoliciesSettings /> }] : []),
		...(has("manage_leave_types") ? [{ id: "leave_types", label: "Leave Types", content: <LeaveTypesSettings /> }] : []),
		...(has("manage_devices") ? [{ id: "devices", label: "Access Devices", content: <DevicesSettings /> }] : []),
	];
	if (!tabs.length) return <p>You do not have permission to manage settings.</p>;
	const initial = tabs.some((tab) => tab.id === params.get("tab")) ? params.get("tab")! : tabs[0].id;
	return <div className="space-y-6"><PageHeader title="Settings" description="Available sections are controlled by your role permissions." icon={Settings2} /><Tabs key={initial} defaultValue={initial} className="space-y-4"><TabsList className="h-auto w-full flex-wrap justify-start">{tabs.map((tab) => <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>)}</TabsList>{tabs.map((tab) => <TabsContent key={tab.id} value={tab.id}>{tab.content}</TabsContent>)}</Tabs></div>;
}
