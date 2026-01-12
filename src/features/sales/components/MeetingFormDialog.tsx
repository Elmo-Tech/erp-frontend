/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormDialog, FormInput, FormSelect } from "@/components/shared";
import { useScheduleMeeting } from "../hooks/useLeads";
import { toast } from "sonner";

const meetingSchema = z.object({
	title: z.string().min(1, "Title is required"),
	location: z.enum(["online", "office", "client_site"]),
	meetingLink: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
	scheduledAt: z.string().min(1, "Date and time is required"),
	durationMinutes: z.string().min(1, "Duration is required"),
});

const LOCATION_OPTIONS = [
	{ value: "online", label: "Online" },
	{ value: "office", label: "Office" },
	{ value: "client_site", label: "Client Site" },
];

const DURATION_OPTIONS = [
	{ value: "15", label: "15 minutes" },
	{ value: "30", label: "30 minutes" },
	{ value: "45", label: "45 minutes" },
	{ value: "60", label: "1 hour" },
	{ value: "90", label: "1.5 hours" },
	{ value: "120", label: "2 hours" },
];

interface MeetingFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leadId: number;
}

export function MeetingFormDialog({ open, onOpenChange, leadId }: MeetingFormDialogProps) {
	const scheduleMeeting = useScheduleMeeting();

	const form = useForm({
		resolver: zodResolver(meetingSchema),
		defaultValues: {
			title: "",
			location: "online",
			meetingLink: "",
			scheduledAt: "",
			durationMinutes: "30",
		},
	});

	const onSubmit = async (data: unknown) => {
		try {
			const formData = data as Record<string, unknown>;
			await scheduleMeeting.mutateAsync({
				leadId,
				payload: {
					title: formData.title as string,
					location: formData.location as "online" | "office" | "client_site",
					meetingLink: formData.meetingLink as string,
					scheduledAt: formData.scheduledAt as string,
					durationMinutes: parseInt(formData.durationMinutes as string, 10),
					attendees: [],
				},
			});
			toast.success("Meeting scheduled successfully");
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error("Failed to schedule meeting");
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
		}
		onOpenChange(open);
	};

	const watchLocation = form.watch("location");

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Schedule Meeting"
			description="Set up a meeting with this lead"
			submitLabel="Schedule Meeting"
			isLoading={scheduleMeeting.isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Meeting Title"
						placeholder="e.g., Project Requirements Discussion"
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormSelect
							control={form.control}
							name="location"
							label="Location"
							options={LOCATION_OPTIONS}
						/>

						<FormSelect
							control={form.control}
							name="durationMinutes"
							label="Duration"
							options={DURATION_OPTIONS}
						/>
					</div>

					<FormField
						control={form.control}
						name="scheduledAt"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Date & Time</FormLabel>
								<FormControl>
									<Input
										type="datetime-local"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{watchLocation === "online" && (
						<FormInput
							control={form.control}
							name="meetingLink"
							label="Meeting Link"
							placeholder="https://meet.google.com/..."
						/>
					)}
				</div>
			</Form>
		</FormDialog>
	);
}
