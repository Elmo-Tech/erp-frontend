"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { User, Building2, Mail, Phone, MapPin, Globe, FileText } from "lucide-react";
import { Client } from "../../../types";

interface ClientInfoTabProps {
	client: Client;
}

export function ClientInfoTab({ client }: ClientInfoTabProps) {
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
	);
}
