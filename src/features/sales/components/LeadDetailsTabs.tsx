"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLead, useLeadActivities, useLeadMeetings } from "../hooks/useLeads";
import { useQuotations } from "../hooks/useQuotations";
import { LeadFormDialog } from "./LeadFormDialog";
import { QuotationBuilder } from "./QuotationBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadStatusBadge, LeadPriorityBadge, QuotationStatusBadge } from "@/components/shared/StatusBadge";
import { User, Building2, Mail, Phone, Globe, FileText, Pencil, ArrowLeft, Plus, Calendar, Clock, DollarSign, MessageSquare, Video, PhoneCall, StickyNote, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { ConvertLeadDialog } from "./ConvertLeadDialog";
import { ActivityFormDialog } from "./ActivityFormDialog";
import { MeetingFormDialog } from "./MeetingFormDialog";

interface LeadDetailsTabsProps {
	leadId: number;
}

const activityIcons = {
	call: PhoneCall,
	email: Mail,
	meeting: Video,
	note: StickyNote,
	status_change: FileText,
};

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

				{/* Information Tab */}
				<TabsContent
					value="info"
					className="space-y-4"
				>
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<User className="h-4 w-4" />
									Contact Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<a
										href={`mailto:${lead.email}`}
										className="text-primary hover:underline"
									>
										{lead.email}
									</a>
								</div>
								{lead.phone && (
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<a
											href={`tel:${lead.phone}`}
											className="hover:underline"
										>
											{lead.phone}
										</a>
									</div>
								)}
								{lead.company && (
									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<span>{lead.company}</span>
									</div>
								)}
								{lead.country && (
									<div className="flex items-center gap-2">
										<Globe className="h-4 w-4 text-muted-foreground" />
										<span>{lead.country}</span>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<DollarSign className="h-4 w-4" />
									Sales Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{lead.expectedBudget && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Expected Budget</span>
										<span className="font-medium">${lead.expectedBudget.toLocaleString()}</span>
									</div>
								)}
								{lead.expectedCloseDate && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Expected Close</span>
										<span className="font-medium">{format(new Date(lead.expectedCloseDate), "MMM d, yyyy")}</span>
									</div>
								)}
								{lead.source && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Source</span>
										<Badge
											variant="outline"
											className="capitalize"
										>
											{lead.source}
										</Badge>
									</div>
								)}
								{lead.lastContactAt && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Last Contact</span>
										<span className="text-sm">{formatDistanceToNow(new Date(lead.lastContactAt), { addSuffix: true })}</span>
									</div>
								)}
							</CardContent>
						</Card>

						{lead.notes && (
							<Card className="md:col-span-2">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<FileText className="h-4 w-4" />
										Notes
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-wrap">{lead.notes}</p>
								</CardContent>
							</Card>
						)}

						{lead.isConverted && lead.client && (
							<Card className="md:col-span-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-300">
										<User className="h-4 w-4" />
										Converted to Client
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										This lead was converted to client{" "}
										<Button
											variant="link"
											className="p-0 h-auto"
											onClick={() => router.push(`/dashboard/clients/${lead.client?.clientId}`)}
										>
											{lead.client.name}
										</Button>
										{lead.convertedAt && ` on ${format(new Date(lead.convertedAt), "MMM d, yyyy")}`}
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				{/* Activities Tab */}
				<TabsContent value="activities">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Activities</CardTitle>
								<CardDescription>Track all interactions with this lead</CardDescription>
							</div>
							<Button onClick={() => setActivityDialogOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Add Activity
							</Button>
						</CardHeader>
						<CardContent>
							{activitiesLoading ? (
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<Skeleton
											key={i}
											className="h-16 w-full"
										/>
									))}
								</div>
							) : activities && activities.length > 0 ? (
								<div className="space-y-3">
									{activities.map((activity) => {
										const Icon = activityIcons[activity.type] || MessageSquare;
										return (
											<div
												key={activity.activityId}
												className="flex gap-4 p-4 border rounded-lg"
											>
												<div className="shrink-0">
													<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
														<Icon className="h-5 w-5 text-muted-foreground" />
													</div>
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center justify-between">
														<p className="font-medium">{activity.title}</p>
														<span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
													</div>
													{activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
													{activity.outcome && (
														<Badge
															variant="outline"
															className="mt-2"
														>
															{activity.outcome}
														</Badge>
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<p className="text-center py-8 text-muted-foreground">No activities yet</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Meetings Tab */}
				<TabsContent value="meetings">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Meetings</CardTitle>
								<CardDescription>Scheduled meetings with this lead</CardDescription>
							</div>
							<Button onClick={() => setMeetingDialogOpen(true)}>
								<CalendarPlus className="h-4 w-4 mr-2" />
								Schedule Meeting
							</Button>
						</CardHeader>
						<CardContent>
							{meetingsLoading ? (
								<div className="space-y-3">
									{[1, 2].map((i) => (
										<Skeleton
											key={i}
											className="h-20 w-full"
										/>
									))}
								</div>
							) : meetings && meetings.length > 0 ? (
								<div className="space-y-3">
									{meetings.map((meeting) => (
										<div
											key={meeting.meetingId}
											className="flex gap-4 p-4 border rounded-lg"
										>
											<div className="shrink-0">
												<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
													<Calendar className="h-5 w-5 text-primary" />
												</div>
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between">
													<p className="font-medium">{meeting.title}</p>
													<Badge
														variant="outline"
														className="capitalize"
													>
														{meeting.location.replace("_", " ")}
													</Badge>
												</div>
												<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{format(new Date(meeting.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{meeting.durationMinutes} min
													</span>
												</div>
												{meeting.meetingLink && (
													<a
														href={meeting.meetingLink}
														target="_blank"
														rel="noopener noreferrer"
														className="text-sm text-primary hover:underline mt-1 inline-block"
													>
														Join Meeting
													</a>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-center py-8 text-muted-foreground">No meetings scheduled</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Quotations Tab */}
				<TabsContent value="quotations">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Quotations</CardTitle>
								<CardDescription>Price quotes sent to this lead</CardDescription>
							</div>
							<Button onClick={() => setQuotationDialogOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Create Quotation
							</Button>
						</CardHeader>
						<CardContent>
							{quotations.length > 0 ? (
								<div className="space-y-3">
									{quotations.map((quotation) => (
										<div
											key={quotation.quotationId}
											className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
										>
											<div>
												<p className="font-medium">{quotation.quotationNumber}</p>
												<p className="text-sm text-muted-foreground">Created {formatDistanceToNow(new Date(quotation.createdAt), { addSuffix: true })}</p>
											</div>
											<div className="flex items-center gap-3">
												<span className="font-medium">
													{quotation.currency} {quotation.finalPrice.toLocaleString()}
												</span>
												<QuotationStatusBadge status={quotation.status} />
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-center py-8 text-muted-foreground">No quotations yet</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			<LeadFormDialog
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

			<Dialog
				open={quotationDialogOpen}
				onOpenChange={setQuotationDialogOpen}
			>
				<DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create Quotation for {lead.name}</DialogTitle>
					</DialogHeader>
					<QuotationBuilder
						initialData={{ leadId: lead.leadId }}
						onSuccess={() => setQuotationDialogOpen(false)}
						onCancel={() => setQuotationDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
