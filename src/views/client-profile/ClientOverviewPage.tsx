"use client";

import { BriefcaseBusiness, Globe2, Mail, MapPin, Phone, RadioTower, ShieldCheck, UserRound } from "lucide-react";
import { ClientTypeLabels } from "@/entities/client/model/types";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";
import { ClientStatusBadge } from "@/shared/ui/data-display/StatusBadge";

export default function ClientOverviewPage() {
	const client = useClientProfile();
	const details = [
		{ label: "Type", value: client.type ? ClientTypeLabels[client.type] : "Not set", icon: BriefcaseBusiness },
		{ label: "Status", value: <ClientStatusBadge status={client.status} size="sm" />, icon: ShieldCheck },
		{ label: "Country", value: client.country || "Not set", icon: MapPin },
		{ label: "Account Mgr", value: client.accountManager?.name || "Unassigned", icon: UserRound },
		{ label: "Lead Source", value: formatValue(client.source), icon: RadioTower },
		{ label: "Phone", value: client.primaryPhone || client.phone || "Not set", icon: Phone },
		{ label: "Email", value: client.primaryEmail || client.email || "Not set", icon: Mail },
		{ label: "Website", value: client.website || "Not set", icon: Globe2 },
	];

	return (
		<section className="rounded-md border bg-background">
			<div className="border-b px-5 py-4">
				<h2 className="text-base font-semibold tracking-tight">Client Information</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
				{details.map((detail) => {
					const Icon = detail.icon;

					return (
						<div
							key={detail.label}
							className="flex min-h-24 gap-3 border-b px-5 py-4 md:border-r md:even:border-r-0 xl:[&:nth-child(4n)]:border-r-0"
						>
							<div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
								<Icon className="size-4" />
							</div>
							<div className="min-w-0 space-y-1">
								<div className="text-xs font-medium text-muted-foreground">{detail.label}</div>
								<div className="break-words text-sm font-medium">{detail.value}</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function formatValue(value: string | null | undefined) {
	if (!value) {
		return "Not set";
	}

	return value
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => `${word[0]?.toUpperCase()}${word.slice(1)}`)
		.join(" ");
}
