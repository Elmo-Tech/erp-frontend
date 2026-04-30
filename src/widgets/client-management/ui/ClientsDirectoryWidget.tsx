"use client";

import { Building2, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { cn } from "@/shared/lib/utils";

interface ClientsDirectoryWidgetProps {
	onAddClient?: () => void;
	className?: string;
}

export function ClientsDirectoryWidget({ onAddClient, className }: ClientsDirectoryWidgetProps) {
	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Clients Directory</h1>
					<p className="text-sm text-muted-foreground">Manage client records, relationships, and commercial context.</p>
				</div>
				<Button onClick={onAddClient}>
					<Plus data-icon="inline-start" />
					Add Client
				</Button>
			</div>

			<Empty className="min-h-96 rounded-md border bg-background">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Building2 />
					</EmptyMedia>
					<EmptyTitle>No clients yet</EmptyTitle>
					<EmptyDescription>Create your first client profile to start tracking contacts, ownership, and opportunities.</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button
						size="sm"
						onClick={onAddClient}
					>
						<Plus data-icon="inline-start" />
						Add Client
					</Button>
				</EmptyContent>
			</Empty>
		</section>
	);
}
