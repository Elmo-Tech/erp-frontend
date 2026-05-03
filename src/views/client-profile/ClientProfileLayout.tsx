"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, UserRound, type LucideIcon } from "lucide-react";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import { ClientTypeLabels, type Client } from "@/entities/client/model/types";
import { useClientPermissions } from "@/entities/user/model/permissions";
import { EditClientModal } from "@/features/clients/ui/EditClientModal";
import { ClientProfileProvider } from "@/widgets/client-management/model/client-profile.context";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ClientStatusBadge } from "@/shared/ui/data-display/StatusBadge";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ClientProfileLayoutProps {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}

const PROFILE_TABS = [
	{ label: "Overview", href: "overview" },
	{ label: "Projects", href: "projects" },
	{ label: "Meetings", href: "meetings" },
	{ label: "Ledger", href: "ledger" },
	{ label: "Activity Log", href: "activity" },
];

const PILL_COLORS = [
	"border-blue-200 bg-blue-50 text-blue-700",
	"border-violet-200 bg-violet-50 text-violet-700",
	"border-emerald-200 bg-emerald-50 text-emerald-700",
	"border-amber-200 bg-amber-50 text-amber-700",
	"border-slate-200 bg-slate-50 text-slate-700",
];

export default function ClientProfileLayout({ children, params }: ClientProfileLayoutProps) {
	const { id } = use(params);
	const router = useRouter();
	const clientId = Number(id);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const { canManageClients, canEditClients } = useClientPermissions();
	const canEditProfile = canManageClients || canEditClients;

	const clientQuery = useQuery({
		queryKey: clientKeys.detail(clientId),
		queryFn: () => clientApi.getClientById(clientId),
		enabled: Number.isFinite(clientId) && clientId > 0,
		staleTime: 5 * 60 * 1000,
	});

	if (clientQuery.isLoading) {
		return <ClientProfileSkeleton />;
	}

	if (clientQuery.error || !clientQuery.data) {
		return (
			<section className="mx-auto flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-md border bg-background px-4 text-center">
				<div className="text-sm font-medium">Client not found</div>
				<p className="max-w-sm text-sm text-muted-foreground">{clientQuery.error?.message || "This client profile is unavailable."}</p>
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

	return (
		<ClientProfileProvider client={clientQuery.data}>
			<div className="mx-auto flex w-full flex-col gap-6">
				<ClientProfileHeader
					client={clientQuery.data}
					canEditProfile={canEditProfile}
					onEditProfile={() => setEditDialogOpen(true)}
				/>
				<ClientProfileTabsNavbar clientId={clientId} />
				{children}
			</div>
			<EditClientModal
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				client={clientQuery.data}
			/>
		</ClientProfileProvider>
	);
}

function ClientProfileHeader({ client, canEditProfile, onEditProfile }: { client: Client; canEditProfile: boolean; onEditProfile: () => void }) {
	const displayName = client.displayName || client.name;
	const initials = getInitials(displayName);
	const location = [client.city, client.state, client.country].filter(Boolean).join(", ") || "Location not set";
	const jobTitle = client.position || (client.type ? ClientTypeLabels[client.type] : "Client");
	const interests = getClientInterests(client);

	return (
		<header className="rounded-md border bg-background">
			<div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex min-w-0 flex-col gap-4">
					<div className="flex min-w-0 items-start gap-4">
						<Avatar className="size-14 border">
							<AvatarFallback className="bg-muted text-base font-semibold text-foreground">{initials}</AvatarFallback>
						</Avatar>
						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="truncate text-2xl font-semibold tracking-tight">{displayName}</h1>
								<Badge
									variant="outline"
									className="rounded-md bg-muted/50 text-xs font-medium"
								>
									{jobTitle}
								</Badge>
							</div>
							<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
								<HeaderMeta icon={Phone}>{client.primaryPhone || client.phone || "Phone not set"}</HeaderMeta>
								<HeaderMeta icon={Mail}>{client.primaryEmail || client.email || "Email not set"}</HeaderMeta>
								<HeaderMeta icon={MapPin}>{location}</HeaderMeta>
								<HeaderMeta icon={UserRound}>{client.accountManager?.name || "Unassigned"}</HeaderMeta>
							</div>
						</div>
					</div>

					{interests.length > 0 && (
						<div className="flex flex-wrap gap-2 pl-0 lg:pl-[72px]">
							{interests.map((interest, index) => (
								<Badge
									key={interest}
									variant="outline"
									className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", PILL_COLORS[index % PILL_COLORS.length])}
								>
									{formatInterest(interest)}
								</Badge>
							))}
						</div>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2 lg:justify-end">
					<ClientStatusBadge
						status={client.status}
						size="lg"
						className="rounded-full"
					/>
					{canEditProfile && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onEditProfile}
						>
							<Pencil data-icon="inline-start" />
							Edit Profile
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}

function ClientProfileTabsNavbar({ clientId }: { clientId: number }) {
	const pathname = usePathname();
	const baseHref = `/dashboard/clients/${clientId}`;

	return (
		<nav className="border-b">
			<div className="flex gap-6 overflow-x-auto">
				{PROFILE_TABS.map((tab) => {
					const href = `${baseHref}/${tab.href}`;
					const isActive = pathname === href || pathname.startsWith(`${href}/`);

					return (
						<Link
							key={tab.href}
							href={href}
							className={cn("whitespace-nowrap border-b-2 px-0.5 pb-3 text-sm font-medium transition-colors", isActive ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground")}
						>
							{tab.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

function HeaderMeta({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
	return (
		<span className="inline-flex min-w-0 items-center gap-1.5">
			<Icon className="size-4 shrink-0" />
			<span className="truncate">{children}</span>
		</span>
	);
}

function ClientProfileSkeleton() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
			<div className="rounded-md border p-5">
				<div className="flex gap-4">
					<Skeleton className="size-14 rounded-full" />
					<div className="flex flex-1 flex-col gap-3">
						<Skeleton className="h-7 w-64" />
						<Skeleton className="h-4 w-full max-w-2xl" />
						<Skeleton className="h-6 w-96" />
					</div>
				</div>
			</div>
			<Skeleton className="h-11 w-full" />
			<Skeleton className="h-72 w-full" />
		</div>
	);
}

function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

function getClientInterests(client: Client) {
	if (Array.isArray(client.interests)) {
		return client.interests;
	}

	const interests = client.metadata?.interests;
	return Array.isArray(interests) ? interests.filter((interest): interest is string => typeof interest === "string") : [];
}

function formatInterest(value: string) {
	return value
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => `${word[0]?.toUpperCase()}${word.slice(1)}`)
		.join(" ");
}
