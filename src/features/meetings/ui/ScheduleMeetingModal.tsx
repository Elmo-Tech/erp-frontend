"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import type { FormTagOption, SelectOption } from "@/shared/ui/forms";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import { getApiErrorMessage, getApiValidationErrors } from "@/shared/lib/api-error";
import { LocationType, MeetingType, scheduleMeetingSchema, type ScheduleMeetingFormData, toScheduleMeetingPayload } from "../model/meeting.schema";
import { useScheduleMeeting } from "../model/use-meeting-actions";
import { FALLBACK_MEETING_TYPE_OPTIONS, ScheduleMeetingForm } from "./ScheduleMeetingForm";

interface ScheduleMeetingModalProps {
	clientId: number;
	clientName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

function tomorrow() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return tomorrow.toISOString().slice(0, 10);
}

function defaultValues(clientId: number, clientName: string): ScheduleMeetingFormData {
	return {
		clientId,
		clientName,
		relatedProjectId: "",
		meetingType: MeetingType.DISCOVERY,
		date: tomorrow(),
		time: "10:00",
		location_type: LocationType.ONLINE,
		location_details: "",
		internalAttendees: [],
		externalAttendees: [],
	};
}

export function ScheduleMeetingModal({ clientId, clientName, open, onOpenChange, onSuccess }: ScheduleMeetingModalProps) {
	const scheduleMeeting = useScheduleMeeting(clientId);
	const form = useForm<ScheduleMeetingFormData>({
		resolver: zodResolver(scheduleMeetingSchema),
		defaultValues: defaultValues(clientId, clientName),
	});

	const projectsQuery = useQuery({
		queryKey: projectKeys.list({ clientId, perPage: 100 }),
		queryFn: () => projectApi.getProjects({ clientId, perPage: 100 }),
		enabled: open,
		staleTime: 5 * 60 * 1000,
	});

	const usersQuery = useGetInternalUsers(open);
	const meetingTypesDict = useSettingsDictionary("meeting-types", open);
	useSettingsDictionary("meeting-statuses", open);

	const projectOptions = useMemo<SelectOption[]>(() => {
		return (projectsQuery.data?.projects ?? []).map((project) => ({
			value: String(project.projectId),
			label: project.title,
		}));
	}, [projectsQuery.data?.projects]);

	const internalAttendeeOptions = useMemo<FormTagOption[]>(() => {
		return (usersQuery.data?.users ?? []).map((user) => ({
			value: String(user.id),
			label: user.name,
		}));
	}, [usersQuery.data?.users]);

	const meetingTypeOptions = meetingTypesDict.options.length > 0 ? meetingTypesDict.options : FALLBACK_MEETING_TYPE_OPTIONS;

	const externalAttendeeOptions = useMemo<FormTagOption[]>(
		() => [
			{ value: "primary-contact", label: clientName },
			{ value: "decision-maker", label: "Decision Maker" },
			{ value: "finance-contact", label: "Finance Contact" },
			{ value: "technical-contact", label: "Technical Contact" },
		],
		[clientName]
	);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(defaultValues(clientId, clientName));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ScheduleMeetingFormData) => {
		try {
			const selectedType = meetingTypeOptions.find((option) => option.value === data.meetingType);
			await scheduleMeeting.mutateAsync(toScheduleMeetingPayload(data, selectedType?.label));
			toast.success("Meeting scheduled successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			const errors = getApiValidationErrors(error);
			if (errors.scheduledAt?.[0]) {
				form.setError("date", { type: "server", message: errors.scheduledAt[0] });
				form.setError("time", { type: "server", message: errors.scheduledAt[0] });
			}

			toast.error(getApiErrorMessage(error, "Failed to schedule meeting"));
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Schedule Meeting"
			description="Plan a client meeting and attach it to a project when relevant."
			submitLabel="Schedule Meeting"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={scheduleMeeting.isPending}
			size="4xl"
		>
			<ScheduleMeetingForm
				form={form}
				projectOptions={projectOptions}
				meetingTypeOptions={meetingTypeOptions}
				internalAttendeeOptions={internalAttendeeOptions}
				externalAttendeeOptions={externalAttendeeOptions}
				isLoadingInternalUsers={usersQuery.isLoading}
				disabled={scheduleMeeting.isPending || meetingTypesDict.isLoading}
			/>
		</FormDialog>
	);
}
