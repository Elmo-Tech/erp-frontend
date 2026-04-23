"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Mail, MapPin, Pencil, Phone, ShieldCheck } from "lucide-react";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import type { Client } from "@/entities/client/model/types";
import { useClientPermissions, useInvoicePermissions } from "@/entities/user/model/permissions";
import { UpdateClientForm } from "@/features/clients/ui/UpdateClientForm";
import { ClientInvoicesWidget } from "@/widgets/finance-management/ui/ClientInvoicesWidget";
import { ClientProjectsWidget } from "@/widgets/project-management/ui/ClientProjectsWidget";
import { Button } from "@/shared/ui/button";
import { ClientStatusBadge } from "@/shared/ui/StatusBadge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

interface ClientDetailsCompositeProps {
	clientId: number;
	className?: string;
}

export function ClientDetailsComposite({ clientId, className }: ClientDetailsCompositeProps) {
	const router = useRouter();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const { canEditClients } = useClientPermissions();
	const { canManageInvoices, canViewInvoices } = useInvoicePermissions();
	const canAccessInvoices = canManageInvoices || canViewInvoices;

	const clientQuery = useQuery({
		queryKey: clientKeys.detail(clientId),
		queryFn: () => clientApi.getClientById(clientId),
		enabled: Number.isFinite(clientId) && clientId > 0,
		staleTime: 5 * 60 * 1000,
	});

	if (clientQuery.isLoading) {
		return <ClientDetailsSkeleton />;
	}

	if (clientQuery.error || !clientQuery.data) {
		return (
			<section className={cn("flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Client not found</div>
				<div className="text-sm text-muted-foreground">{clientQuery.error?.message || "This client record is unavailable."}</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push("/dashboard/clients")}
				>
					<ArrowLeft data-icon="inline-start" />
					Back to clients
				</Button>
			</section>
		);
	}

	const client = clientQuery.data;
	const projects = client.projects ?? [];

	return (
		<section className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => router.push("/dashboard/clients")}
						aria-label="Back to clients"
					>
						<ArrowLeft />
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="truncate text-2xl font-semibold tracking-tight">{client.name}</h1>
							<ClientStatusBadge status={client.status} />
						</div>
						<p className="truncate text-sm text-muted-foreground">{client.company || client.email}</p>
					</div>
				</div>

				{canEditClients && (
					<Button
						size="sm"
						onClick={() => setEditDialogOpen(true)}
					>
						<Pencil data-icon="inline-start" />
						Edit client
					</Button>
				)}
			</div>

			<Tabs
				defaultValue="info"
				className="flex flex-col gap-4"
			>
				<TabsList className="w-fit">
					<TabsTrigger value="info">Information</TabsTrigger>
					<TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
					{canAccessInvoices && <TabsTrigger value="invoices">Invoices</TabsTrigger>}
				</TabsList>

				<TabsContent value="info">
					<ClientInfoPanel client={client} />
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

			<UpdateClientForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				client={client}
			/>
		</section>
	);
}

function ClientInfoPanel({ client }: { client: Client }) {
	const details = [
		{ label: "Email", value: client.email, icon: Mail },
		{ label: "Phone", value: client.phone || "Not set", icon: Phone },
		{ label: "Company", value: client.company || "Not set", icon: Building2 },
		{ label: "Location", value: [client.city, client.country].filter(Boolean).join(", ") || "Not set", icon: MapPin },
		{ label: "Portal", value: client.hasPortalAccess ? "Enabled" : "Not enabled", icon: ShieldCheck },
		{ label: "Revenue", value: formatCurrency(client.totalRevenue ?? 0), icon: Building2 },
	];

	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<div className="border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">Client profile</div>
			<div className="grid grid-cols-1 md:grid-cols-2">
				{details.map((detail) => {
					const Icon = detail.icon;

					return (
						<div
							key={detail.label}
							className="flex min-h-14 items-center gap-3 border-b px-3 py-2.5 last:border-b-0 md:border-r md:even:border-r-0"
						>
							<Icon className="text-muted-foreground" />
							<div className="min-w-0">
								<div className="text-xs text-muted-foreground">{detail.label}</div>
								<div className="truncate text-sm font-medium">{detail.value}</div>
							</div>
						</div>
					);
				})}
				<div className="min-h-14 border-b px-3 py-2.5 md:col-span-2">
					<div className="text-xs text-muted-foreground">Notes</div>
					<div className="text-sm font-medium">{client.notes || "No notes"}</div>
				</div>
			</div>
		</div>
	);
}

function ClientDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Skeleton className="size-8" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-7 w-56" />
					<Skeleton className="h-4 w-40" />
				</div>
			</div>
			<Skeleton className="h-10 w-80" />
			<Skeleton className="h-72 w-full" />
		</div>
	);
}
