"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormSelect, FormTextarea, FormInput } from "@/components/shared";
import { useCompleteMeetingWithFeedback } from "../../../hooks/useLeads";
import { toast } from "sonner";
import { meetingFeedbackSchema, MeetingFeedbackFormData, MeetingOutcome, MeetingOutcomeLabels } from "../../../schemas/meetingFeedbackSchema";
import { LeadMeeting } from "../../../types/lead";
import { format } from "date-fns";

const OUTCOME_OPTIONS = Object.entries(MeetingOutcomeLabels).map(([value, label]) => ({
	value: value as MeetingOutcome,
	label,
}));

interface MeetingFeedbackDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	meeting: LeadMeeting | null;
	leadId: number;
	teamLeadId?: number;
}

export function MeetingFeedbackDialog({ open, onOpenChange, meeting, leadId, teamLeadId }: MeetingFeedbackDialogProps) {
	const completeMeeting = useCompleteMeetingWithFeedback();

	const form = useForm<MeetingFeedbackFormData>({
		resolver: zodResolver(meetingFeedbackSchema),
		defaultValues: {
			outcome: undefined,
			feedback: "",
			nextAction: "",
			followUpDate: "",
		},
	});

	const feedbackValue = form.watch("feedback");
	const feedbackLength = feedbackValue?.length || 0;
	const isValid = feedbackLength >= 20;

	const onSubmit = async (data: MeetingFeedbackFormData) => {
		if (!meeting) return;

		try {
			await completeMeeting.mutateAsync({
				leadId,
				meetingId: meeting.meetingId,
				payload: data,
				teamLeadId,
			});
			toast.success("Meeting completed with feedback");
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error("Failed to complete meeting");
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			form.reset();
		}
		onOpenChange(isOpen);
	};

	if (!meeting) return null;

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Complete Meeting with Feedback"
			description={`Provide feedback for: ${meeting.title} (${format(new Date(meeting.scheduledAt), "MMM d, yyyy 'at' h:mm a")})`}
			submitLabel="Complete Meeting"
			isLoading={completeMeeting.isPending}
			onSubmit={form.handleSubmit(onSubmit)}
			isSubmitDisabled={!isValid}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormSelect
						control={form.control}
						name="outcome"
						label="Meeting Outcome"
						options={OUTCOME_OPTIONS}
						placeholder="Select outcome"
					/>

					<div className="space-y-2">
						<FormTextarea
							control={form.control}
							name="feedback"
							label="Meeting Feedback"
							placeholder="Describe what was discussed, client feedback, next steps, and any important details from the meeting... (minimum 20 characters)"
							rows={5}
						/>
						<div className="flex justify-end">
							<span className={`text-xs ${isValid ? "text-green-600" : feedbackLength > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{feedbackLength}/20 characters minimum</span>
						</div>
					</div>

					<FormInput
						control={form.control}
						name="nextAction"
						label="Next Action (Optional)"
						placeholder="e.g., Send proposal, Schedule follow-up call"
					/>

					<FormInput
						control={form.control}
						name="followUpDate"
						label="Follow-up Date (Optional)"
						type="date"
						placeholder="Select a follow-up date"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
