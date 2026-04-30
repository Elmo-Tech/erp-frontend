"use client";

import { BriefcaseBusiness, CircleDollarSign, UserCheck, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useClientsQuery } from "@/entities/client/api/client.api";
import { ClientStatus } from "@/entities/client/model/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

interface ClientStatsWidgetProps {
	className?: string;
}

export function ClientStatsWidget({ className }: ClientStatsWidgetProps) {
	const clientsQuery = useClientsQuery({ perPage: 100 });
	const clients = clientsQuery.data?.clients ?? [];

	const stats = [
		{
			label: "Active Clients",
			value: clients.filter((client) => client.status === ClientStatus.ACTIVE).length,
			icon: UserCheck,
			helper: "Ready for active work",
		},
		{
			label: "Total Clients",
			value: clientsQuery.data?.pagination.total ?? clients.length,
			icon: UsersRound,
			helper: "Across all statuses",
		},
		{
			label: "Active Projects",
			value: clients.reduce((total, client) => total + (client.activeProjectsCount ?? 0), 0),
			icon: BriefcaseBusiness,
			helper: "Currently in motion",
		},
		{
			label: "Total Revenue",
			value: formatCurrency(clients.reduce((total, client) => total + Number(client.totalRevenue ?? 0), 0)),
			icon: CircleDollarSign,
			helper: "Recorded client value",
		},
	];

	return (
		<section className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
			{stats.map((stat) => {
				const Icon = stat.icon;

				return (
					<Card
						key={stat.label}
						className="gap-3 rounded-md py-4 shadow-none hover:-translate-y-0 hover:border-border hover:shadow-none"
					>
						<CardHeader className="flex grid-cols-none flex-row items-center justify-between gap-3 px-4">
							<CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
							<Icon className="text-muted-foreground" />
						</CardHeader>
						<CardContent className="flex flex-col gap-1 px-4">
							{clientsQuery.isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>}
							<p className="text-xs text-muted-foreground">{stat.helper}</p>
						</CardContent>
					</Card>
				);
			})}
		</section>
	);
}
