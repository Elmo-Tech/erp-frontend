"use client";

import { use } from "react";
import { ClientProjectView } from "@/features/client-portal/components/ClientProjectView";

interface ClientProjectDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

/**
 * Client Project Detail Page
 * Route: /client/projects/[id]
 * Uses ClientProjectView component to display project details with progress and invoices.
 *
 * Requirements: 14.1 - Display project details with progress bar and invoices
 */
export default function ClientProjectDetailPage({ params }: ClientProjectDetailPageProps) {
	const { id } = use(params);
	const projectId = parseInt(id, 10);

	if (isNaN(projectId)) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Invalid Project</h1>
					<p className="text-muted-foreground">The project ID provided is not valid.</p>
				</div>
			</div>
		);
	}

	return <ClientProjectView projectId={projectId} />;
}
