import { z } from "zod";

export enum MeetingOutcome {
	SUCCESS = "success",
	NEEDS_FOLLOW_UP = "needs_follow_up",
	LOST = "lost",
	ON_HOLD = "on_hold",
}

export const MeetingOutcomeLabels: Record<MeetingOutcome, string> = {
	[MeetingOutcome.SUCCESS]: "Successful - Moving Forward",
	[MeetingOutcome.NEEDS_FOLLOW_UP]: "Needs Follow-up",
	[MeetingOutcome.LOST]: "Lost",
	[MeetingOutcome.ON_HOLD]: "On Hold",
};

export const meetingFeedbackSchema = z.object({
	outcome: z.nativeEnum(MeetingOutcome, {
		message: "Please select an outcome",
	}),
	feedback: z.string().min(20, "Feedback must be at least 20 characters").max(5000, "Feedback must not exceed 5000 characters"),
	nextAction: z.string().optional(),
	followUpDate: z.string().optional(),
});

export type MeetingFeedbackFormData = z.infer<typeof meetingFeedbackSchema>;
