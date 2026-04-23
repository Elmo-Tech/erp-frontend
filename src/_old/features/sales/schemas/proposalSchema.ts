import { z } from "zod";

// Proposal Action Types based on LEAD_TO_CLIENT_WORKFLOW_MASTER_PLAN.md
export const ProposalActionType = {
	UPLOAD: "upload",
	SCHEDULE: "schedule",
	SKIP: "skip",
} as const;

export type ProposalActionType = (typeof ProposalActionType)[keyof typeof ProposalActionType];

const proposalBaseSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
});

const expiryDaysSchema = z.coerce.number().min(1, "Expiry days must be at least 1");
const assignedToSchema = z.coerce.number().min(1, "Assignee is required");

const proposalSkipSchema = proposalBaseSchema.extend({
	actionType: z.literal(ProposalActionType.SKIP),
	skipReason: z.string().min(30, "Skip reason must be at least 30 characters"),
});

const proposalUploadSchema = proposalBaseSchema.extend({
	actionType: z.literal(ProposalActionType.UPLOAD),
	expiryDays: expiryDaysSchema,
	file: z.instanceof(File, { message: "File is required" }),
});

const proposalScheduleSchema = proposalBaseSchema.extend({
	actionType: z.literal(ProposalActionType.SCHEDULE),
	expiryDays: expiryDaysSchema,
	taskAssignedTo: assignedToSchema,
	taskDueDate: z.string().min(1, "Due date is required"),
});

export const createProposalSchema = z.discriminatedUnion("actionType", [proposalUploadSchema, proposalScheduleSchema, proposalSkipSchema]);
export type CreateProposalFormData = z.infer<typeof createProposalSchema>;
