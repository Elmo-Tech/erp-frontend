"use client";

import { NotesPanel } from "@/entities/notes";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";

export default function ClientNotesPage() {
	const client = useClientProfile();

	return (
		<NotesPanel
			modelType="client"
			modelId={client.clientId}
		/>
	);
}
