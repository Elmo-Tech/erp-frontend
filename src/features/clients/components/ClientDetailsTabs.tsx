"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClient } from "../hooks/useClients";
import { ClientFormDialog } from "./ClientFormDialog";
import { ProjectFormDialog } from "@/features/projects/components/ProjectFormDialog";
import { InvoiceFormDialog } from "@/features/invoices/components/InvoiceFormDialog";
import { useInvoices, useUpdateInvoice } from "@/features/invoices/hooks/useInvoices";
import { InvoiceStatus } from "@/features/invoices/types";
import { User, Building2, Mail, Phone, MapPin, Globe, FileText, Pencil, ArrowLeft, Plus, MoreHorizontal, CheckCircle, XCircle, Send, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface ClientDetailsTabsProps {
	clientId: number;
}

export function ClientDetailsTabs({ clientId }: ClientDetailsTabsProps) {
	const router = useRouter();
	const { data: client, isLoading } = useClient(clientId);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [projectDialogOpen, setProjectDialogOpen] = useState(false);
	const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

	// Fetch invoices for this client's projects
	const projectIds = client?.projects?.map((p) => p.projectId) || [];
	const { data: invoicesData } = useInvoices(projectIds.length > 0 ? { projectId: projectIds[0], perPage: 100 } : undefined);
	const updateInvoice = useUpdateInvoice();

	const handleUpdateInvoiceStatus = async (invoiceId: number, status: InvoiceStatus) => {
		try {
			await updateInvoice.mutateAsync({
				id: invoiceId,
				payload: { status },
			});
			toast.success(`Invoice marked as ${status}`);
		} catch {
			toast.error("Failed to update invoice status");
		}
	};

	const getStatusBadgeVariant = (status: InvoiceStatus) => {
		switch (status) {
			case InvoiceStatus.PAID:
				return "default";
			case InvoiceStatus.OVERDUE:
				return "destructive";
			case InvoiceStatus.SENT:
				return "secondary";
			case InvoiceStatus.DRAFT:
				return "outline";
			case InvoiceStatus.CANCELLED:
				return "destructive";
			default:
				return "secondary";
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!client) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Client not found</p>
				<Button
					variant="link"
					onClick={() => router.push("/dashboard/clients")}
				>
					Back to Clients
				</Button>
			</div>
		);
	}

	const projects = client.projects || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/dashboard/clients")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							{client.name}
							<Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>
						</h1>
						<p className="text-muted-foreground">{client.company || "No company"}</p>
					</div>
				</div>
				<Button onClick={() => setEditDialogOpen(true)}>
					<Pencil className="h-4 w-4 mr-2" />
					Edit Client
				</Button>
			</div>

			{/* Tabs */}
			<Tabs
				defaultValue="info"
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="info">Information</TabsTrigger>
					<TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
					<TabsTrigger value="invoices">Invoices ({invoicesData?.invoices?.length || 0})</TabsTrigger>
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
									<span>{client.email}</span>
								</div>
								{client.phone && (
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span>{client.phone}</span>
									</div>
								)}
								{client.position && (
									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<span>{client.position}</span>
									</div>
								)}
								{client.website && (
									<div className="flex items-center gap-2">
										<Globe className="h-4 w-4 text-muted-foreground" />
										<a
											href={client.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{client.website}
										</a>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									Address
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1">
								{client.address && <p>{client.address}</p>}
								{(client.city || client.country) && <p className="text-muted-foreground">{[client.city, client.country].filter(Boolean).join(", ")}</p>}
								{!client.address && !client.city && !client.country && <p className="text-muted-foreground">No address provided</p>}
							</CardContent>
						</Card>

						{client.notes && (
							<Card className="md:col-span-2">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<FileText className="h-4 w-4" />
										Notes
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-wrap">{client.notes}</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				{/* Projects Tab */}
				<TabsContent value="projects">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Projects</CardTitle>
								<CardDescription>All projects associated with this client</CardDescription>
							</div>
							<Button onClick={() => setProjectDialogOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Add Project
							</Button>
						</CardHeader>
						<CardContent>
							{projects.length > 0 ? (
								<div className="space-y-3">
									{projects.map((project) => (
										<Link
											key={project.projectId}
											href={`/dashboard/projects/${project.projectId}`}
											className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
										>
											<div>
												<p className="font-medium">{project.title}</p>
												<p className="text-sm text-muted-foreground">
													Budget: ${Number(project.budget || 0).toLocaleString()}
													{project.deadline && ` • Due: ${project.deadline}`}
												</p>
											</div>
											<Badge>{project.status}</Badge>
										</Link>
									))}
								</div>
							) : (
								<p className="text-center py-8 text-muted-foreground">No projects yet</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Invoices Tab */}
				<TabsContent value="invoices">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Invoices</CardTitle>
								<CardDescription>All invoices for this client</CardDescription>
							</div>
							<Button
								onClick={() => setInvoiceDialogOpen(true)}
								disabled={projects.length === 0}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Invoice
							</Button>
						</CardHeader>
						<CardContent>
							{invoicesData?.invoices && invoicesData.invoices.length > 0 ? (
								<div className="space-y-3">
									{invoicesData.invoices.map((invoice) => (
										<div
											key={invoice.invoiceId}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div>
												<p className="font-medium">{invoice.invoiceNumber}</p>
												<p className="text-sm text-muted-foreground">
													{invoice.project?.title} • Due: {invoice.dueDate}
												</p>
											</div>
											<div className="flex items-center gap-3">
												<span className="font-medium">
													{invoice.currency} {Number(invoice.amount).toLocaleString()}
												</span>
												<Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															disabled={updateInvoice.isPending}
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => handleUpdateInvoiceStatus(invoice.invoiceId, InvoiceStatus.DRAFT)}
															disabled={invoice.status === InvoiceStatus.DRAFT}
														>
															<FileText className="h-4 w-4 mr-2" />
															Mark as Draft
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleUpdateInvoiceStatus(invoice.invoiceId, InvoiceStatus.SENT)}
															disabled={invoice.status === InvoiceStatus.SENT}
														>
															<Send className="h-4 w-4 mr-2" />
															Mark as Sent
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleUpdateInvoiceStatus(invoice.invoiceId, InvoiceStatus.PAID)}
															disabled={invoice.status === InvoiceStatus.PAID}
														>
															<CheckCircle className="h-4 w-4 mr-2" />
															Mark as Paid
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleUpdateInvoiceStatus(invoice.invoiceId, InvoiceStatus.OVERDUE)}
															disabled={invoice.status === InvoiceStatus.OVERDUE}
														>
															<Clock className="h-4 w-4 mr-2" />
															Mark as Overdue
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleUpdateInvoiceStatus(invoice.invoiceId, InvoiceStatus.CANCELLED)}
															disabled={invoice.status === InvoiceStatus.CANCELLED}
															className="text-destructive"
														>
															<XCircle className="h-4 w-4 mr-2" />
															Cancel Invoice
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-center py-8 text-muted-foreground">{projects.length === 0 ? "Create a project first to add invoices" : "No invoices yet"}</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<ClientFormDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				client={client}
			/>

			<ProjectFormDialog
				open={projectDialogOpen}
				onOpenChange={setProjectDialogOpen}
				clientId={clientId}
			/>

			<InvoiceFormDialog
				open={invoiceDialogOpen}
				onOpenChange={setInvoiceDialogOpen}
				clientId={clientId}
				projects={projects.map((p) => ({ projectId: p.projectId, title: p.title }))}
			/>
		</div>
	);
}
