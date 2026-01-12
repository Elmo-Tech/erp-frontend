"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDialog } from "@/components/shared";
import { useLead, useLeadActivities, useLeadMeetings } from "../hooks/useLeads";
import { useQuotations } from "../hooks/useQuotations";
import { UpdateLeadForm } from "./leads";
import { QuotationBuilder } from "./QuotationBuilder";
import { LeadStatusBadge, LeadPriorityBadge } from "@/components/shared/StatusBadge";
import { Pencil, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConvertLeadDialog } from "./ConvertLeadDialog";
import { ActivityFormDialog } from "./ActivityFormDialog";
import { MeetingFormDialog } from "./MeetingFormDialog";
import { LeadInfoTab, LeadActivitiesTab, LeadMeetingsTab, LeadQuotationsTab } from "./leads/tabs";

interface LeadDetailsTabsProps {
	leadId: number;
}

export function LeadDetailsTabs({ leadId }: LeadDetailsTabsProps) {
	const router = useRouter();
	const { data: lead, isLoading } = useLead(leadId);
	const { data: activities, isLoading: activitiesLoading } = useLeadActivities(leadId);
	const { data: meetings, isLoading: meetingsLoading } = useLeadMeetings(leadId);
	const { data: quotationsData } = useQuotations({ leadId, perPage: 100 });

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
	const [convertDialogOpen, setConvertDialogOpen] = useState(false);
	const [activityDialogOpen, setActivityDialogOpen] = useState(false);
	const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!lead) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Lead not found</p>
				<Button
					variant="link"
					onClick={() => router.push("/dashboard/sales")}
				>
					Back to Sales
				</Button>
			</div>
		);
	}

	const quotations = quotationsData?.quotations || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/dashboard/sales")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							{lead.name}
							<LeadStatusBadge status={lead.status} />
							<LeadPriorityBadge priority={lead.priority} />
						</h1>
						<p className="text-muted-foreground">{lead.company || "No company"}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{lead.status !== "won" && lead.status !== "lost" && (
						<Button
							variant="outline"
							onClick={() => setConvertDialogOpen(true)}
						>
							Convert to Client
						</Button>
					)}
					<Button onClick={() => setEditDialogOpen(true)}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit Lead
					</Button>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				defaultValue="info"
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="info">Information</TabsTrigger>
					<TabsTrigger value="activities">Activities ({activities?.length || 0})</TabsTrigger>
					<TabsTrigger value="meetings">Meetings ({meetings?.length || 0})</TabsTrigger>
					<TabsTrigger value="quotations">Quotations ({quotations.length})</TabsTrigger>
				</TabsList>

				<TabsContent
					value="info"
					className="space-y-4"
				>
					<LeadInfoTab lead={lead} />
				</TabsContent>

				<TabsContent value="activities">
					<LeadActivitiesTab
						activities={activities}
						isLoading={activitiesLoading}
						onAddActivity={() => setActivityDialogOpen(true)}
					/>
				</TabsContent>

				<TabsContent value="meetings">
					<LeadMeetingsTab
						meetings={meetings}
						isLoading={meetingsLoading}
						onScheduleMeeting={() => setMeetingDialogOpen(true)}
					/>
				</TabsContent>

				<TabsContent value="quotations">
					<LeadQuotationsTab
						quotations={quotations}
						onCreateQuotation={() => setQuotationDialogOpen(true)}
					/>
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			<UpdateLeadForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				lead={lead}
			/>

			<ConvertLeadDialog
				open={convertDialogOpen}
				onOpenChange={setConvertDialogOpen}
				lead={lead}
			/>

			<ActivityFormDialog
				open={activityDialogOpen}
				onOpenChange={setActivityDialogOpen}
				leadId={leadId}
			/>

			<MeetingFormDialog
				open={meetingDialogOpen}
				onOpenChange={setMeetingDialogOpen}
				leadId={leadId}
			/>

			<FormDialog
				open={quotationDialogOpen}
				onOpenChange={setQuotationDialogOpen}
				title={`Create Quotation for ${lead.name}`}
				showFooter={false}
				size="full"
			>
				<QuotationBuilder
					initialData={{ leadId: lead.leadId }}
					onSuccess={() => setQuotationDialogOpen(false)}
					onCancel={() => setQuotationDialogOpen(false)}
				/>
			</FormDialog>
		</div>
	);
}
