"use client";

import { Can } from "@/shared/ui/Can";
import { MeetingsList } from "@/entities/meetings/ui/MeetingsList";
import { PolyMeetingForm } from "@/features/meetings/ui/PolyMeetingForm";
import { useClientProfile } from "@/widgets/client-management/model/client-profile.context";

export default function ClientMeetingsPage() {
	const client = useClientProfile();

	return (
		<section className="flex flex-col gap-4">
			<Can permission="schedule_meetings">
				<PolyMeetingForm
					modelType="client"
					modelId={client.clientId}
				/>
			</Can>

			<MeetingsList
				modelType="client"
				modelId={client.clientId}
			/>
		</section>
	);
}
