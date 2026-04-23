"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { User, Building2, Mail, Phone, Globe, FileText, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Lead } from "../../../types/lead";

interface LeadInfoTabProps {
	lead: Lead;
}

export function LeadInfoTab({ lead }: LeadInfoTabProps) {
	const router = useRouter();

	return (
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
	);
}
