"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ClientStatusBadge } from "@/shared/ui/StatusBadge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useInvoicePermissions } from "@/entities/user/model/permissions";
import { ClientInvoicesWidget } from "@/widgets/finance-management/ui/ClientInvoicesWidget";
import { ClientProjectsWidget } from "@/widgets/project-management/ui/ClientProjectsWidget";
import { useClient } from "../hooks/useClients";
import { UpdateClientForm } from "./clients/forms/UpdateClientForm";
import { PortalAccessDialog } from "./PortalAccessDialog";
import { ClientInfoTab } from "./clients";
import { Pencil, ArrowLeft, Key, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientDetailsTabsProps {
	clientId: number;
}

export function ClientDetailsTabs({ clientId }: ClientDetailsTabsProps) {
	const router = useRouter();
	const { data: client, isLoading } = useClient(clientId);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [portalAccessDialogOpen, setPortalAccessDialogOpen] = useState(false);
	const { canManageInvoices, canViewInvoices } = useInvoicePermissions();
	const canAccessInvoices = canManageInvoices || canViewInvoices;

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
			<ClientDetailsHeader
				client={client}
				onBack={() => router.push("/dashboard/clients")}
				onEdit={() => setEditDialogOpen(true)}
				onPortalAccess={() => setPortalAccessDialogOpen(true)}
			/>

			{/* Tabs */}
			<Tabs
				defaultValue="info"
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="info">Information</TabsTrigger>
					<TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
					{canAccessInvoices && <TabsTrigger value="invoices">Invoices</TabsTrigger>}
				</TabsList>

				<TabsContent
					value="info"
					className="space-y-4"
				>
					<ClientInfoTab client={client} />
				</TabsContent>

				<TabsContent value="projects">
					<ClientProjectsWidget
						clientId={clientId}
						clientName={client.name}
					/>
				</TabsContent>

				{canAccessInvoices && (
					<TabsContent value="invoices">
						<ClientInvoicesWidget
							clientId={clientId}
							projects={projects.map((project) => ({ projectId: project.projectId, title: project.title }))}
						/>
					</TabsContent>
				)}
			</Tabs>

			{/* Dialogs */}
			<UpdateClientForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				client={client}
			/>
			<PortalAccessDialog
				open={portalAccessDialogOpen}
				onOpenChange={setPortalAccessDialogOpen}
				client={client}
			/>
		</div>
	);
}

// Header Sub-component
interface ClientDetailsHeaderProps {
	client: { name: string; company?: string; status: string; hasPortalAccess?: boolean };
	onBack: () => void;
	onEdit: () => void;
	onPortalAccess: () => void;
}

function ClientDetailsHeader({ client, onBack, onEdit, onPortalAccess }: ClientDetailsHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={onBack}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						{client.name}
						<ClientStatusBadge status={client.status} />
					</h1>
					<p className="text-muted-foreground">{client.company || "No company"}</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					onClick={onPortalAccess}
				>
					{client.hasPortalAccess ? (
						<>
							<ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
							Manage Portal
						</>
					) : (
						<>
							<Key className="h-4 w-4 mr-2" />
							Create Portal Access
						</>
					)}
				</Button>
				<Button onClick={onEdit}>
					<Pencil className="h-4 w-4 mr-2" />
					Edit Client
				</Button>
			</div>
		</div>
	);
}
