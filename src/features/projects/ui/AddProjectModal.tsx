"use client";

/**
 * AddProjectModal
 *
 * Thin wrapper around CreateProjectForm — used when opening the project
 * creation dialog from a Client detail page where clientId is already known.
 *
 * Delegates all form logic to CreateProjectForm (which uses ProjectFormFields
 * and createDirectProjectSchema) so there is a single source of truth for
 * the project creation form layout.
 */

import { CreateProjectForm } from "./CreateProjectForm";

interface AddProjectModalProps {
	clientId: number;
	clientName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function AddProjectModal({ clientId, clientName, open, onOpenChange, onSuccess }: AddProjectModalProps) {
	return (
		<CreateProjectForm
			open={open}
			onOpenChange={onOpenChange}
			clientId={clientId}
			clientName={clientName}
			onSuccess={onSuccess}
		/>
	);
}
